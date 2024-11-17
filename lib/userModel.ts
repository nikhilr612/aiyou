import mongoose, { Schema, Document, Model } from "mongoose";

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/aiyou-user", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.debug("MongoDB connected"))
  .catch((err) => console.error("MongoError:", err));

// Define the IUser interface
interface IUser extends Document {
  email: string;
  password: string;
  token: string;
}

// Define the user schema
const userSchema: Schema<IUser> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  token:  {
    type: String,
    required: false,
  }
});

// Check if the model already exists, otherwise define it
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;

