import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DownloadIcon from '@mui/icons-material/Download';
import TvIcon from '@mui/icons-material/Tv';
import SpeedIcon from '@mui/icons-material/Speed';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { useTranslation } from "react-i18next";

const GITHUB_RELEASES = 'https://github.com/zhimin-dev/iptv-checker-player';

/**
 * 播放介绍：引导用户下载配套客户端 iptv-checker-player（GitHub Releases）
 */
export default function PlayIntro() {
    const { t } = useTranslation();
    const features = [
        { icon: <TvIcon fontSize="small" color="primary" />, text: t('客户端特性1') },
        { icon: <SpeedIcon fontSize="small" color="primary" />, text: t('客户端特性2') },
        { icon: <PhotoLibraryIcon fontSize="small" color="primary" />, text: t('客户端特性3') },
        { icon: <LiveTvIcon fontSize="small" color="primary" />, text: t('客户端特性4') },
    ];
    return (
        <Box style={{ padding: '0 20px', width: '100%', maxWidth: '900px' }}>
            <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    {t('播放介绍')}
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                    {t('播放介绍说明')}
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<DownloadIcon />}
                    onClick={() => window.open(GITHUB_RELEASES, '_blank')}
                >
                    {t('前往GitHub下载')}
                </Button>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                    {t('下载说明')}
                </Typography>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    {t('客户端特性')}
                </Typography>
                <List dense>
                    {features.map((f, i) => (
                        <ListItem key={i}>
                            <ListItemIcon>{f.icon}</ListItemIcon>
                            <ListItemText primary={f.text} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
}
