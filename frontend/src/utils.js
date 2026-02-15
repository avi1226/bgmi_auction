export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const roleLabels = {
  IGL: 'In-Game Leader',
  Assaulter: 'Assaulter',
  Support: 'Support',
  Sniper: 'Sniper'
};

export const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Regular expression to match various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    // Fallback if regex doesn't match standard IDs but URL looks like YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
         // Try to extract v param if simple match failed
         try {
             const urlObj = new URL(url);
             const v = urlObj.searchParams.get('v');
             if (v) return `https://www.youtube.com/embed/${v}`;
         } catch (e) {
             // invalid url
         }
    }

    return null;
};
