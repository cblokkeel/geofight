import mongoose from "mongoose";
import { populateFlags } from "../models/flags";

export default defineNitroPlugin(async () => {
    const config = useRuntimeConfig();
    const uri = config.MONGODB_URI;
    
    console.log("Attempting to connect to MongoDB with uri", uri);

    let retries = 5;
    while (retries) {
        try {
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log("MongoDB Connected Successfully");
            
            await populateFlags();
            break;
        } catch (error: any) {
            console.error(`MongoDB connection error: ${error.message}`);
            retries -= 1;
            console.log(`Retries left: ${retries}`);
            if (retries === 0) {
                console.error("Failed to connect to MongoDB after multiple attempts");
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
});

