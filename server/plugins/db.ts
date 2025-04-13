import mongoose from "mongoose";
import { populateFlags } from "../models/flags";

export default defineNitroPlugin(async () => {
    await mongoose.connect(useRuntimeConfig().MONGODB_URI);
    console.log("MongoDB Connected");

    await populateFlags();
});
