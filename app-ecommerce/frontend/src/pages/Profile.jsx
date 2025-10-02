import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material'
import { 
  Person, 
  Edit, 
  Save, 
  Cancel,
  Lock,
  PhotoCamera
} from '@mui/icons-material'

import { useAuth } from '../context/AuthContext'
import { userAPI } from '../services/api'

const profileSchema = yup.object().shape({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().optional(),
  address: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  zipCode: yup.string().optional(),
})

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
})

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Profile form
  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      zipCode: user?.zipCode || '',
    }
  })

  // Password form
  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  })

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    setSuccess('')
    setError('')
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form when cancelling
      profileForm.reset()
    }
    setIsEditing(!isEditing)
    setSuccess('')
    setError('')
  }

  const handleProfileUpdate = async (data) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await userAPI.updateProfile(data)
      updateUser(response.data)
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (data) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Password changes handled by Keycloak - redirect to account management
      const keycloakAccountUrl = `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/account`;
      window.open(keycloakAccountUrl, '_blank');
      
      setSuccess('Redirected to Keycloak account management for password change');
      passwordForm.reset();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const ProfileTab = () => (
    <Box>
      {/* Avatar Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            sx={{ width: 100, height: 100, mr: 3 }}
            src={user?.avatar}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          {isEditing && (
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 24,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': { backgroundColor: 'primary.dark' }
              }}
              size="small"
            >
              <PhotoCamera fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Box>
          <Typography variant="h5" gutterBottom>
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Profile Form */}
      <Box component="form" onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              disabled={!isEditing}
              error={!!profileForm.formState.errors.name}
              helperText={profileForm.formState.errors.name?.message}
              {...profileForm.register('name')}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              disabled={!isEditing}
              error={!!profileForm.formState.errors.email}
              helperText={profileForm.formState.errors.email?.message}
              {...profileForm.register('email')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              disabled={!isEditing}
              error={!!profileForm.formState.errors.phone}
              helperText={profileForm.formState.errors.phone?.message}
              {...profileForm.register('phone')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Address"
              disabled={!isEditing}
              error={!!profileForm.formState.errors.address}
              helperText={profileForm.formState.errors.address?.message}
              {...profileForm.register('address')}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              disabled={!isEditing}
              error={!!profileForm.formState.errors.city}
              helperText={profileForm.formState.errors.city?.message}
              {...profileForm.register('city')}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              disabled={!isEditing}
              error={!!profileForm.formState.errors.state}
              helperText={profileForm.formState.errors.state?.message}
              {...profileForm.register('state')}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ZIP Code"
              disabled={!isEditing}
              error={!!profileForm.formState.errors.zipCode}
              helperText={profileForm.formState.errors.zipCode?.message}
              {...profileForm.register('zipCode')}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEditToggle}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleEditToggle}
                disabled={loading}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  )

  const PasswordTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Change Password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Update your password to keep your account secure.
      </Typography>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Password Form */}
      <Box 
        component="form" 
        onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
        sx={{ maxWidth: 400 }}
      >
        <TextField
          fullWidth
          label="Current Password"
          type="password"
          margin="normal"
          error={!!passwordForm.formState.errors.currentPassword}
          helperText={passwordForm.formState.errors.currentPassword?.message}
          {...passwordForm.register('currentPassword')}
        />

        <TextField
          fullWidth
          label="New Password"
          type="password"
          margin="normal"
          error={!!passwordForm.formState.errors.newPassword}
          helperText={passwordForm.formState.errors.newPassword?.message}
          {...passwordForm.register('newPassword')}
        />

        <TextField
          fullWidth
          label="Confirm New Password"
          type="password"
          margin="normal"
          error={!!passwordForm.formState.errors.confirmPassword}
          helperText={passwordForm.formState.errors.confirmPassword?.message}
          {...passwordForm.register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
          disabled={loading}
          sx={{ mt: 3 }}
        >
          Change Password
        </Button>
      </Box>
    </Box>
  )

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <Paper sx={{ mt: 3 }}>
        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Profile Information" 
            icon={<Person />} 
            iconPosition="start"
          />
          <Tab 
            label="Change Password" 
            icon={<Lock />} 
            iconPosition="start"
          />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 4 }}>
          {activeTab === 0 && <ProfileTab />}
          {activeTab === 1 && <PasswordTab />}
        </Box>
      </Paper>
    </Container>
  )
}

export default Profile