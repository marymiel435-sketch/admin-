import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Chip, TextField, Button, CircularProgress } from '@mui/material';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { AppColors } from '../theme/colors';
import * as firestoreService from '../services/firestoreService';

// Mirrors lib/screens/stores/pabili_categories_dialog.dart — admin-facing
// CRUD for the Pabili sub-categories (Pharmacy, Grocery, ...). Writes go
// straight to app_config/pabili_categories; the store registration form
// reads the same live stream, so a new category is selectable immediately.
export default function PabiliCategoriesDialog({ open, onClose }) {
  const [categories, setCategories] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    const unsubscribe = firestoreService.streamPabiliCategories(setCategories, () => {});
    return unsubscribe;
  }, [open]);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed || !categories) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError('That category already exists');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await firestoreService.savePabiliCategories([...categories, trimmed]);
      setName('');
    } catch (e) {
      setError(`Failed to add: ${e?.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (cat) => {
    if (!categories) return;
    try {
      await firestoreService.savePabiliCategories(categories.filter((c) => c !== cat));
    } catch {
      setError('Failed to remove category');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CategoryOutlinedIcon sx={{ color: AppColors.primary, fontSize: 20 }} />
        <Box sx={{ flex: 1 }}>Pabili Categories</Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 12.5, color: AppColors.textSecondary, mb: 2 }}>
          Store types a customer can pick when registering a Pabili store. Adding one here makes it available immediately.
        </Typography>

        {categories === null ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
            <CircularProgress size={22} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {categories.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  onDelete={categories.length > 1 ? () => handleRemove(c) : undefined}
                  sx={{ bgcolor: `${AppColors.primary}14`, fontSize: 12.5 }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1.25 }}>
              <TextField
                fullWidth
                size="small"
                label="New category"
                placeholder="e.g. Hardware"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                error={Boolean(error)}
                helperText={error}
                InputProps={{ startAdornment: <AddCircleOutlineIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }}
              />
              <Button variant="contained" disabled={saving} onClick={handleAdd} sx={{ flexShrink: 0 }}>
                Add
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
