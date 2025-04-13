import mongoose from "mongoose";
import { populateFlags } from "../models/flags";

export default defineNitroPlugin(async () => {
    const uri = useRuntimeConfig().MONGODB_URI;
    console.log("Connecting to MongoDB...", uri);
    await mongoose.connect(uri);
    console.log("MongoDB Connected");

    await populateFlags();
});
