import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local")
}

// In development, use a global variable so the connection is reused across hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | null
}

let cached = global._mongooseConn

async function connectDB(): Promise<typeof mongoose> {
  if (cached) return cached

  cached = await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  })
  global._mongooseConn = cached
  return cached
}

export default connectDB
