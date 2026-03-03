import express from "express"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb"
import { z } from "zod"

const app = express()
app.use(cors())
app.use(express.json())

const port = process.env.PORT ? Number(process.env.PORT) : 4000
const mongoUrl = process.env.MONGO_URL ? process.env.MONGO_URL : "mongodb://127.0.0.1:27017"
const dbName = process.env.MONGO_DB ? process.env.MONGO_DB : "intern_tracker"

const StageSchema = z.enum(["APPLIED", "OA", "INTERVIEW", "OFFER", "REJECTED"])

const CreateSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  stage: StageSchema,
  jobUrl: z.string().optional(),
  notes: z.string().optional(),
  nextActionAt: z.string().optional()
})

const PatchSchema = z.object({
  company: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  stage: StageSchema.optional(),
  jobUrl: z.string().optional(),
  notes: z.string().optional(),
  nextActionAt: z.string().optional()
})

const client = new MongoClient(mongoUrl)

type ApplicationDoc = {
  _id: ObjectId
  company: string
  role: string
  stage: string
  jobUrl?: string
  notes?: string
  nextActionAt?: string
  createdAt: string
  updatedAt: string
}

function toApi(doc: ApplicationDoc) {
  return {
    id: doc._id.toHexString(),
    company: doc.company,
    role: doc.role,
    stage: doc.stage,
    jobUrl: doc.jobUrl,
    notes: doc.notes,
    nextActionAt: doc.nextActionAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  }
}

app.get("/health", (req, res) => {
  res.json({ ok: true })
})

app.get("/applications", async (req, res) => {
  const db = client.db(dbName)
  const col = db.collection<ApplicationDoc>("applications")
  const docs = await col.find({}).sort({ updatedAt: -1 }).toArray()
  res.json(docs.map(toApi))
})

app.post("/applications", async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_payload" })
    return
  }

  const now = new Date().toISOString()
  const db = client.db(dbName)
  const col = db.collection<ApplicationDoc>("applications")

  const doc = {
    _id: new ObjectId(),
    company: parsed.data.company.trim(),
    role: parsed.data.role.trim(),
    stage: parsed.data.stage,
    jobUrl: parsed.data.jobUrl && parsed.data.jobUrl.length ? parsed.data.jobUrl : undefined,
    notes: parsed.data.notes && parsed.data.notes.length ? parsed.data.notes : undefined,
    nextActionAt: parsed.data.nextActionAt && parsed.data.nextActionAt.length ? parsed.data.nextActionAt : undefined,
    createdAt: now,
    updatedAt: now
  }

  await col.insertOne(doc as ApplicationDoc)
  res.status(201).json(toApi(doc as ApplicationDoc))
})

app.patch("/applications/:id", async (req, res) => {
  const parsed = PatchSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_payload" })
    return
  }

  let oid: ObjectId
  try {
    oid = new ObjectId(req.params.id)
  } catch {
    res.status(400).json({ error: "invalid_id" })
    return
  }

  const now = new Date().toISOString()
  const patch: any = { ...parsed.data, updatedAt: now }

  if (patch.company) patch.company = patch.company.trim()
  if (patch.role) patch.role = patch.role.trim()

  const db = client.db(dbName)
  const col = db.collection<ApplicationDoc>("applications")
  const r = await col.findOneAndUpdate({ _id: oid }, { $set: patch }, { returnDocument: "after" })

  if (!r.value) {
    res.status(404).json({ error: "not_found" })
    return
  }

  res.json(toApi(r.value as ApplicationDoc))
})

app.delete("/applications/:id", async (req, res) => {
  let oid: ObjectId
  try {
    oid = new ObjectId(req.params.id)
  } catch {
    res.status(400).json({ error: "invalid_id" })
    return
  }

  const db = client.db(dbName)
  const col = db.collection<ApplicationDoc>("applications")
  const r = await col.deleteOne({ _id: oid })

  if (r.deletedCount === 0) {
    res.status(404).json({ error: "not_found" })
    return
  }

  res.status(204).send()
})

async function main() {
  await client.connect()
  app.listen(port, () => {
    console.log(`api listening on ${port}`)
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
