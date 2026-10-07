import getYouTubeID from 'get-youtube-id';

export const extractVideoId = (url) => {
    if (!url) return null;
    // get-youtube-id handles various formats including shortened ones
    return getYouTubeID(url);
};

export const fetchVideoDetails = async (videoId) => {
    try {
        // using noembed as a free way to grab basic youtube title/thumbnail without API keys
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await res.json();
        return {
            title: data.title || 'Unknown Title',
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            channelName: data.author_name || 'Unknown Channel'
        };
    } catch (err) {
        console.error("Failed to fetch video details", err);
        // fallback
        return {
            title: 'YouTube Video',
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            channelName: 'Unknown'
        };
    }
};
