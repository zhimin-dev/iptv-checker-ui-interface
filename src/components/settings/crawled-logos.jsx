import React from 'react';
import Box from '@mui/material/Box';
import CrawledLogosPanel from './CrawledLogosPanel';

/**
 * 爬取频道图标：展示爬取到的台标整理区（页面不再显示标题文字）
 */
export default function CrawledLogosPage() {
    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <CrawledLogosPanel />
        </Box>
    );
}
