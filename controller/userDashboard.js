const express =require("express")
const bcrypt = require('bcrypt');
const User = require("../model/userModel");
const Address = require('../model/addressModel')
const Product = require('../model/productModel')


//profile------------

const getProfiledata = async(req,res)=>{
     try{
        const userId = req.params.id;
        console.log(userId)
        console.log('Full req.params:', req.params);
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
          }

          const user = await User.findById(userId)
          .select('-password') 
          .lean()
          
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
          
          const address = await Address.findOne({
            user: userId,
            isDefault: true
          }).lean() || await Address.findOne({ user: userId }).lean();

        //   if (!address) {
        //     return res.status(404).json({ message: 'No address found' });
        //   }

          res.status(200).json({
            userData:user,
            address
          })
          
     }catch(error){
        console.error('Detailed error:', error);  
        res.status(500).json({ 
          message: 'Error fetching profile data', 
          error: error.message,
          stack: error.stack  
        });
     }
}

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { formData, address } = req.body;

    
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }


        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { 
                firstname: formData.firstname,
                lastname: formData.lastname,
                email: formData.email,
                phone: formData.phone
            }, 
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has any addresses
        const existingAddresses = await Address.find({ user: userId });

        // Check if the new address already exists
        const addressExists = await Address.findOne({
            user: userId,
            city: address.city,
            country: address.country,
            state: address.state,
            district: address.district,
            pincode: address.pincode
        });

        let savedAddress;

        if (addressExists) {
            // If address exists, update it
            savedAddress = await Address.findByIdAndUpdate(
                addressExists._id,
                {
                    city: address.city,
                    country: address.country,
                    state: address.state,
                    district: address.district,
                    pincode: address.pincode
                },
                { new: true }
            );
        } else {
            // If no addresses exist, create new address and set as default
            if (existingAddresses.length === 0) {
                savedAddress = new Address({
                    user: userId,
                    city: address.city,
                    country: address.country,
                    state: address.state,
                    district: address.district,
                    pincode: address.pincode,
                    isDefault: true
                });
                await savedAddress.save();
            } else {
                // If addresses exist, add as a new address
                savedAddress = new Address({
                    user: userId,
                    city: address.city,
                    country: address.country,
                    state: address.state,
                    district: address.district,
                    pincode: address.pincode,
                    isDefault: false
                });
                await savedAddress.save();
            }
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser,
            address: savedAddress
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            message: 'Error updating profile', 
            error: error.message 
        });
    }
};

const changePassword = async (req, res) => {
    try {

        const { currentPassword, newPassword } = req.body;
        const userId = req.params.id; 

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Current password and new password are required' 
            });
        }

        // Find the user by ID
        const user = await User.findById(userId);

        // If user not found
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Check if user signed up with Google
        if (user.isGoogleUser) {
            // If user already has a password, verify the current password
            if (user.password) {
                // For Google users with existing password, verify current password
                const isCurrentPasswordCorrect = await bcrypt.compare(
                    currentPassword, 
                    user.password
                );

                // If current password is incorrect
                if (!isCurrentPasswordCorrect) {
                    return res.status(401).json({ 
                        message: 'Current password is incorrect' 
                    });
                }
            }

            // Hash and save new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;
            await user.save();

            return res.status(200).json({ 
                message: 'Password successfully set/updated' 
            });
        }

        // For non-Google users, verify current password
        if (!user.password) {
            return res.status(400).json({ 
                message: 'No password set for this account' 
            });
        }

        // Compare current password
        const isCurrentPasswordCorrect = await bcrypt.compare(
            currentPassword, 
            user.password
        );

        // If current password is incorrect
        if (!isCurrentPasswordCorrect) {
            return res.status(401).json({ 
                message: 'Current password is incorrect' 
            });
        }

        // Validate new password (optional but recommended)
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'New password must be at least 6 characters long' 
            });
        }

        // Hash and save new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ 
            message: 'Password successfully changed' 
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ 
            message: 'An error occurred while changing the password',
            error: error.message 
        });
    }
};

const profileImgUpdate = async(req,res)=>{
      try{
        const { id } = req.params;

        const { profileImage } = req.body;
        console.log(profileImage)

        if (!id || !profileImage) {
            return res.status(400).json({ 
              message: 'User ID and profile image URL are required' 
            });
          }

          const updatedUser = await User.findByIdAndUpdate(
            id, 
            { profileImage }, 
            { new: true, runValidators: true }
          );

          if (!updatedUser) {
            return res.status(404).json({ 
              message: 'User not found' 
            });
          }
          
          res.status(200).json({
            message: 'Profile image updated successfully',
            user: {
              id: updatedUser._id,
              profileImage: updatedUser.profileImage
            }
          });
          
          
      }catch(error){
        console.error('Profile image update error:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
              message: 'Invalid data provided',
              errors: Object.values(error.errors).map(err => err.message)
            });
          }

          res.status(500).json({ 
            message: 'Failed to update profile image',
            error: error.message 
          });   
      }
}

//Address-----------------

const getAdressOfaUser = async(req,res)=>{
    try {
        const {id} = req.params;
        console.log(id)
        const addresses = await Address.find({ user:id });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching addresses' });
    }
}

const setNewAddressForUser = async (req, res) => {
    try {
        const { id: userId } = req.params;
        const formData = req.body;

        console.log('User ID:', userId);
        console.log('Form Data:', formData);

        // Validate input
        if (!userId || !formData) {
            return res.status(400).json({ message: 'Missing user ID or address data' });
        }

        // Check if the exact same address already exists
        const existingAddress = await Address.findOne({
            user: userId,
            fullName: formData.fullName,
            Address: formData.Address,
            city: formData.city,
            district: formData.district,
            state: formData.state,
            country: formData.country,
            pincode: formData.pincode,
            phone: formData.phone
        });

        if (existingAddress) {
            return res.status(409).json({ message: 'This address already exists' });
        }

        // If the new address is set as default
        if (formData.isDefault) {
            // Find and update any existing default address
            await Address.updateMany(
                { user: userId, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        // Create new address
        const newAddress = new Address({
            user: userId,
            ...formData
        });

        // Save the new address
        const savedAddress = await newAddress.save();

        res.status(201).json({
            message: 'Address added successfully',
            address: savedAddress
        });

    } catch (error) {
        console.error('Detailed error adding new address:', error);
        res.status(500).json({ 
            message: 'Failed to add address', 
            error: error.toString(),
            stack: error.stack
        });
    }
};

const updateAddress = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Find the address being updated
        const addressToUpdate = await Address.findById(id);
        
        if (!addressToUpdate) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // If the update is setting this as the default address
        if (updateData.isDefault === true) {
            // Find existing default address for this user
            const existingDefaultAddress = await Address.findOne({
                user: addressToUpdate.user,
                isDefault: true
            });

            // If an existing default address exists
            if (existingDefaultAddress && existingDefaultAddress._id.toString() !== id) {
                // Update the existing default address to not be default
                await Address.findByIdAndUpdate(existingDefaultAddress._id, { isDefault: false });
            }
        }

        // Update the address with the new data
        const updatedAddress = await Address.findByIdAndUpdate(
            id, 
            { 
                ...updateData, 
                user: addressToUpdate.user 
            }, 
            { new: true } // Return the updated document
        );

        res.status(200).json(updatedAddress);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ 
            message: 'Error updating address', 
            error: error.message 
        });
    }
};


const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the address
        const deletedAddress = await Address.findByIdAndDelete(id);

        // If no address found, return 404
        if (!deletedAddress) {
            return res.status(404).json({ 
                message: 'Address not found' 
            });
        }

        // Respond with success message
        res.status(200).json({ 
            message: 'Address deleted successfully',
            deletedAddress 
        });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ 
            message: 'Failed to delete address', 
            error: error.message 
        });
    }
};




module.exports = {
    getProfiledata,
    updateUserProfile,
    changePassword,
    profileImgUpdate,
    getAdressOfaUser,
    setNewAddressForUser,
    updateAddress,
    deleteAddress
}