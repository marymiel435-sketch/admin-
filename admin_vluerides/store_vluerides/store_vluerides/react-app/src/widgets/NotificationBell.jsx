import CloseIcon from '@mui/icons-material/Close';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';

import { NotificationService } from '../services/notificationService';

function relativeTime(time) {
  if (time == null) return '';
  const diffMs = Date.now() - time.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${time.getMonth() + 1}/${time.getDate()}/${time.getFullYear()}`;
}

function NotificationTile({ uid, item }) {
  return (
    <Box
      onClick={item.read ? undefined : () => NotificationService.markAsRead(uid, item.id)}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        px: 2,
        py: 1.5,
        cursor: item.read ? 'default' : 'pointer',
        bgcolor: item.read ? 'transparent' : 'primary.50',
      }}
    >
      <Box pt={0.6}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: item.read ? 'transparent' : 'primary.main',
          }}
        />
      </Box>
      <Box width={10} />
      <Box flex={1} minWidth={0}>
        <Typography variant="body2" fontWeight={item.read ? 600 : 800} fontSize={13.5}>
          {item.title}
        </Typography>
        {item.body && (
          <Typography variant="caption" color="text.secondary" display="block" mt={0.3} sx={{ lineHeight: 1.3 }}>
            {item.body}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" display="block" mt={0.4}>
          {relativeTime(item.createdAt)}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          NotificationService.delete(uid, item.id);
        }}
      >
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
}

// Bell icon in the dashboard top bar. Clicking it opens an anchored
// dropdown panel listing the signed-in owner's notifications from
// `notifications/{uid}/items`.
export default function NotificationBell({ uid }) {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const unsub = NotificationService.streamUnreadCount(uid, setUnread);
    return unsub;
  }, [uid]);

  useEffect(() => {
    const unsub = NotificationService.streamNotifications(uid, (list) => {
      loadedRef.current = true;
      setItems(list);
    });
    return unsub;
  }, [uid]);

  const open = Boolean(anchorEl);

  return (
    <>
      <Box position="relative" display="inline-flex">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <NotificationsOutlinedIcon />
        </IconButton>
        {unread > 0 && (
          <Box
            sx={{
              position: 'absolute',
              right: 6,
              top: 6,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'primary.main',
            }}
          />
        )}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box width={340} maxHeight={420} display="flex" flexDirection="column">
          <Box display="flex" alignItems="center" px={2} py={1.75}>
            <Typography fontWeight={800} fontSize={15}>
              Notifications
            </Typography>
            <Box flex={1} />
            {items?.some((n) => !n.read) && (
              <Button
                size="small"
                onClick={() =>
                  NotificationService.markAllAsRead(
                    uid,
                    items.filter((n) => !n.read).map((n) => n.id)
                  )
                }
              >
                Mark all read
              </Button>
            )}
          </Box>
          <Divider />
          <Box overflow="auto">
            {items == null ? (
              <Box p={3} display="flex" justifyContent="center">
                <CircularProgress size={24} />
              </Box>
            ) : items.length === 0 ? (
              <Box p={3.5} display="flex" justifyContent="center">
                <Typography color="text.secondary">No notifications yet.</Typography>
              </Box>
            ) : (
              items.map((item, i) => (
                <Box key={item.id}>
                  {i > 0 && <Divider />}
                  <NotificationTile uid={uid} item={item} />
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
}
