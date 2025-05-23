import mongoose from 'mongoose';

export const DBConnect = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGOOSE_URL}`)
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Can't connect to MongoDB", error);
        process.exit(1);
        
    }
}