//user mopngoose model
const mongoose= require('mongoose');
const bcrypt=require('bcryptjs')


const userSchema =new  mongoose.Schema(
{
  username:{
     type:String,
     required:[true,"Username is required"],
     unique:true,
     trim:true},

   email:{
     type:String,
     required:[true,"Email is required"],
     unique:true,
     trim:true,
     lowercase:true,
     match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "Please enter a valid email address"]},

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    }
},

{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);


// 1. Password Hashing Pre-Save Hook
userSchema.pre('save', async function () {
  // If the password hasn't changed, stop here and don't re-hash it
  if (!this.isModified('password')) return;

  // Hash the password and replace the plain text
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 2. Compare Password Method
userSchema.methods.comparePassword = async function (enteredPassword) {
  // Compare the plain text password from login with the stored hashed password
  return await bcrypt.compare(enteredPassword, this.password);
};

// 3. Hide Password from API Responses
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password; // Remove password before returning user object
  return user;
};






















}













)