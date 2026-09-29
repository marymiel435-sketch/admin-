import UploadIcon from '@mui/icons-material/Upload';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';

// Pick + preview an image. `onImageSelected(file, contentType)` is called
// with the raw File (a Blob — accepted directly by Firebase Storage's
// uploadBytes) so callers never need to touch object URLs themselves.
export default function ImageUploadField({ label, initialImageUrl, onImageSelected, uploading = false }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageSelected(file, file.type || 'image/jpeg');
  };

  const hasImage = previewUrl != null || (initialImageUrl != null && initialImageUrl !== '');

  return (
    <Box display="flex" flexDirection="column" alignItems="flex-start">
      <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
        {label}
      </Typography>
      <Box
        sx={{
          width: 160,
          height: 160,
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          bgcolor: 'grey.100',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : initialImageUrl ? (
          <img src={initialImageUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <ImageOutlinedIcon sx={{ fontSize: 40, color: 'grey.500' }} />
        )}
      </Box>
      <Box height={8} />
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleChange} />
      <Button
        variant="outlined"
        disabled={uploading}
        startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
        onClick={() => inputRef.current?.click()}
      >
        {hasImage ? 'Change photo' : 'Choose photo'}
      </Button>
    </Box>
  );
}
