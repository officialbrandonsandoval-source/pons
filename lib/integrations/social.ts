import { ISocialMediaAdapter, IntegrationConfig, SocialProfile, SocialPost, SocialAnalytics } from '@/types/integrations'

export class TwitterAdapter implements ISocialMediaAdapter {
  private accessToken: string = ''
  private connected = false
  private baseUrl = 'https://api.twitter.com/2'

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'twitter') {
      throw new Error('Invalid integration type for Twitter adapter')
    }

    this.accessToken = config.accessToken || ''
    
    try {
      // Test connection by fetching user profile
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })
      
      this.connected = response.ok
      return this.connected
    } catch (error) {
      console.error('Twitter connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getProfile(): Promise<SocialProfile> {
    if (!this.connected) throw new Error('Not connected to Twitter')

    const response = await fetch(
      `${this.baseUrl}/users/me?user.fields=profile_image_url,description,public_metrics,verified`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )

    const data = await response.json()
    const user = data.data

    return {
      id: user.open_id,
      platform: 'tiktok',
      username: user.display_name,
      displayName: user.display_name,
      followers: user.follower_count,
      following: user.following_count,
      bio: user.bio_description,
      profileImage: user.avatar_url || '',
      verified: user.is_verified || false,
    }
  }

  async getPosts(limit = 50): Promise<SocialPost[]> {
    if (!this.connected) throw new Error('Not connected to Twitter')

    const response = await fetch(
      `${this.baseUrl}/users/me/tweets?max_results=${limit}&tweet.fields=created_at,public_metrics`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )

    const data = await response.json()
    
    return data.data?.map((tweet: any) => ({
      id: tweet.id,
      platform: 'twitter' as const,
      content: tweet.text,
      timestamp: new Date(tweet.created_at),
      likes: tweet.public_metrics.like_count,
      comments: tweet.public_metrics.reply_count,
      shares: tweet.public_metrics.retweet_count,
      engagement: tweet.public_metrics.like_count + tweet.public_metrics.reply_count + tweet.public_metrics.retweet_count,
    })) || []
  }

  async getAnalytics(days: number = 30): Promise<SocialAnalytics> {
    const posts = await this.getPosts(100)
    const profile = await this.getProfile()
    
    // Sum up all engagement metrics
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0)
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0)
    const totalShares = posts.reduce((sum, post) => sum + post.shares, 0)
    
    return {
      platform: 'tiktok',
      totalPosts: posts.length,
      totalEngagement: totalLikes + totalComments + totalShares,
      averageLikes: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0,
      topPosts: posts.sort((a, b) => b.engagement - a.engagement).slice(0, 5),
      bestPostingTimes: [],
      audienceGrowth: 0,
    }
  }

  async createPost(content: string, media?: string[]): Promise<SocialPost> {
    if (!this.connected) throw new Error('Not connected to Twitter')

    const response = await fetch(`${this.baseUrl}/tweets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: content }),
    })

    const data = await response.json()

    return {
      id: data.data.id,
      platform: 'twitter',
      content,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      engagement: 0,
      media,
    }
  }

  async sync(): Promise<void> {
    // Sync latest posts and profile data
    await this.getProfile()
    await this.getPosts(50)
  }

  async getInsights(): Promise<any> {
    const profile = await this.getProfile()
    const analytics = await this.getAnalytics(30)
    
    return {
      profile,
      analytics,
      recommendations: [
        'Post more during peak hours (9 AM - 12 PM)',
        'Engagement is highest on educational content',
        'Consider using more hashtags',
      ],
    }
  }
}

// Similar adapters for Instagram, LinkedIn, etc.
export class InstagramAdapter implements ISocialMediaAdapter {
  private accessToken: string = ''
  private connected = false
  private baseUrl = 'https://graph.instagram.com'
  private userId: string = ''

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'instagram') {
      throw new Error('Invalid integration type for Instagram adapter')
    }

    this.accessToken = config.accessToken || ''
    // this.userId would need to be fetched from Instagram API or passed separately
    this.connected = !!this.accessToken
    return this.connected
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getProfile(): Promise<SocialProfile> {
    if (!this.connected) throw new Error('Not connected to Instagram')

    const response = await fetch(
      `${this.baseUrl}/${this.userId}?fields=id,username,account_type,media_count,followers_count,follows_count&access_token=${this.accessToken}`
    )
    const data = await response.json()

    return {
      id: data.id,
      platform: 'instagram',
      username: data.username,
      displayName: data.username,
      bio: '',
      followers: data.followers_count || 0,
      following: data.follows_count || 0,
      verified: false,
      profileImage: '',
    }
  }

  async getPosts(limit = 50): Promise<SocialPost[]> {
    if (!this.connected) throw new Error('Not connected to Instagram')

    const response = await fetch(
      `${this.baseUrl}/${this.userId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${this.accessToken}`
    )
    const data = await response.json()

    return (data.data || []).map((post: any) => ({
      id: post.id,
      platform: 'instagram' as const,
      content: post.caption || '',
      timestamp: new Date(post.timestamp),
      likes: post.like_count || 0,
      comments: post.comments_count || 0,
      shares: 0,
      engagement: (post.like_count || 0) + (post.comments_count || 0),
      media: [post.media_url],
    }))
  }

  async getAnalytics(days = 30): Promise<SocialAnalytics> {
    if (!this.connected) throw new Error('Not connected to Instagram')

    const posts = await this.getPosts(50)
    const profile = await this.getProfile()
    
    const totalLikes = posts.reduce((sum: number, p: SocialPost) => sum + p.likes, 0)
    const totalComments = posts.reduce((sum: number, p: SocialPost) => sum + p.comments, 0)
    const totalShares = posts.reduce((sum: number, p: SocialPost) => sum + p.shares, 0)
    
    return {
      platform: 'instagram',
      totalPosts: posts.length,
      totalEngagement: totalLikes + totalComments + totalShares,
      averageLikes: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0,
      topPosts: posts.sort((a, b) => b.likes - a.likes).slice(0, 5),
      bestPostingTimes: [],
      audienceGrowth: 0,
    }
  }

  async createPost(content: string, media?: string[]): Promise<SocialPost> {
    if (!this.connected) throw new Error('Not connected to Instagram')

    // Instagram requires media for posts
    if (!media || media.length === 0) {
      throw new Error('Instagram posts require at least one media item')
    }

    // Step 1: Create media container
    const containerResponse = await fetch(
      `${this.baseUrl}/${this.userId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: media[0],
          caption: content,
          access_token: this.accessToken,
        }),
      }
    )
    const containerData = await containerResponse.json()

    // Step 2: Publish media container
    const publishResponse = await fetch(
      `${this.baseUrl}/${this.userId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: this.accessToken,
        }),
      }
    )
    const publishData = await publishResponse.json()

    return {
      id: publishData.id,
      platform: 'instagram',
      content,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      engagement: 0,
      media,
    }
  }

  async sync(): Promise<void> {
    await this.getProfile()
    await this.getPosts(50)
    await this.getAnalytics(30)
  }

  async getInsights(): Promise<any> {
    const analytics = await this.getAnalytics(30)
    const profile = await this.getProfile()
    const posts = await this.getPosts(50)
    
    return {
      profile,
      analytics,
      insights: [
        `You have ${profile.followers} followers`,
        `Average engagement: ${(analytics.totalEngagement / posts.length).toFixed(1)} per post`,
        `Top post has ${analytics.topPosts[0]?.likes || 0} likes`,
      ],
    }
  }
}

export class LinkedInAdapter implements ISocialMediaAdapter {
  private accessToken: string = ''
  private connected = false
  private baseUrl = 'https://api.linkedin.com/v2'
  private userId: string = ''

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'linkedin') {
      throw new Error('Invalid integration type for LinkedIn adapter')
    }

    this.accessToken = config.accessToken || ''
    // this.userId would need to be fetched from LinkedIn API or passed separately
    this.connected = !!this.accessToken
    return this.connected
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getProfile(): Promise<SocialProfile> {
    if (!this.connected) throw new Error('Not connected to LinkedIn')

    const response = await fetch(`${this.baseUrl}/me`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()

    const connectionsResponse = await fetch(
      `${this.baseUrl}/connections?q=viewer`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )
    const connectionsData = await connectionsResponse.json()

    return {
      id: data.id,
      platform: 'linkedin',
      username: '',
      displayName: `${data.localizedFirstName} ${data.localizedLastName}`,
      followers: 0,
      following: connectionsData.paging?.total || 0,
      bio: '',
      profileImage: data.profilePicture?.displayImage || '',
      verified: false,
    }
  }

  async getPosts(limit = 50): Promise<SocialPost[]> {
    if (!this.connected) throw new Error('Not connected to LinkedIn')

    const response = await fetch(
      `${this.baseUrl}/ugcPosts?q=authors&authors=List(urn:li:person:${this.userId})&count=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )
    const data = await response.json()

    return (data.elements || []).map((post: any) => ({
      id: post.id,
      platform: 'linkedin' as const,
      content: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
      timestamp: new Date(post.created?.time || Date.now()),
      likes: post.numLikes || 0,
      comments: post.numComments || 0,
      shares: post.numShares || 0,
      engagement: (post.numLikes || 0) + (post.numComments || 0) + (post.numShares || 0),
    }))
  }

  async getAnalytics(days = 30): Promise<SocialAnalytics> {
    if (!this.connected) throw new Error('Not connected to LinkedIn')

    const posts = await this.getPosts(50)
    const profile = await this.getProfile()
    
    const totalLikes = posts.reduce((sum: number, p: SocialPost) => sum + p.likes, 0)
    const totalComments = posts.reduce((sum: number, p: SocialPost) => sum + p.comments, 0)
    const totalShares = posts.reduce((sum: number, p: SocialPost) => sum + p.shares, 0)
    
    return {
      platform: 'linkedin',
      totalPosts: posts.length,
      totalEngagement: totalLikes + totalComments + totalShares,
      averageLikes: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0,
      topPosts: posts.sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)).slice(0, 5),
      bestPostingTimes: [],
      audienceGrowth: 0,
    }
  }

  async createPost(content: string, media?: string[]): Promise<SocialPost> {
    if (!this.connected) throw new Error('Not connected to LinkedIn')

    const response = await fetch(`${this.baseUrl}/ugcPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        author: `urn:li:person:${this.userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    })
    const data = await response.json()

    return {
      id: data.id,
      platform: 'linkedin',
      content,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      engagement: 0,
      media: media || [],
    }
  }

  async sync(): Promise<void> {
    await this.getProfile()
    await this.getPosts(50)
    await this.getAnalytics(30)
  }

  async getInsights(): Promise<any> {
    const analytics = await this.getAnalytics(30)
    const profile = await this.getProfile()
    
    return {
      profile,
      analytics,
      insights: [
        `You have ${profile.following} connections`,
        `Total engagement: ${analytics.totalEngagement}`,
        `Best performing post: ${analytics.topPosts[0]?.content.substring(0, 50)}...`,
      ],
    }
  }
}

export class FacebookAdapter implements ISocialMediaAdapter {
  private accessToken: string = ''
  private connected = false
  private baseUrl = 'https://graph.facebook.com/v18.0'
  private userId: string = 'me'

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'facebook') {
      throw new Error('Invalid integration type for Facebook adapter')
    }

    this.accessToken = config.accessToken || ''
    this.connected = !!this.accessToken
    return this.connected
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getProfile(): Promise<SocialProfile> {
    if (!this.connected) throw new Error('Not connected to Facebook')

    const response = await fetch(
      `${this.baseUrl}/${this.userId}?fields=id,name,picture,friends,posts&access_token=${this.accessToken}`
    )
    const data = await response.json()

    return {
      id: data.id,
      platform: 'facebook',
      username: data.id,
      displayName: data.name,
      followers: 0,
      following: data.friends?.summary?.total_count || 0,
      bio: '',
      profileImage: data.picture?.data?.url || '',
      verified: false,
    }
  }

  async getPosts(limit = 50): Promise<SocialPost[]> {
    if (!this.connected) throw new Error('Not connected to Facebook')

    const response = await fetch(
      `${this.baseUrl}/${this.userId}/posts?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares&limit=${limit}&access_token=${this.accessToken}`
    )
    const data = await response.json()

    return (data.data || []).map((post: any) => ({
      id: post.id,
      platform: 'facebook' as const,
      content: post.message || '',
      timestamp: new Date(post.created_time),
      likes: post.likes?.summary?.total_count || 0,
      comments: post.comments?.summary?.total_count || 0,
      shares: post.shares?.count || 0,
      engagement: (post.likes?.summary?.total_count || 0) + (post.comments?.summary?.total_count || 0) + (post.shares?.count || 0),
    }))
  }

  async getAnalytics(days = 30): Promise<SocialAnalytics> {
    if (!this.connected) throw new Error('Not connected to Facebook')

    const posts = await this.getPosts(50)
    const profile = await this.getProfile()
    
    const totalLikes = posts.reduce((sum: number, p: SocialPost) => sum + p.likes, 0)
    const totalComments = posts.reduce((sum: number, p: SocialPost) => sum + p.comments, 0)
    const totalShares = posts.reduce((sum: number, p: SocialPost) => sum + p.shares, 0)
    
    return {
      platform: 'facebook',
      totalPosts: posts.length,
      totalEngagement: totalLikes + totalComments + totalShares,
      averageLikes: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0,
      topPosts: posts.sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)).slice(0, 5),
      bestPostingTimes: [],
      audienceGrowth: 0,
    }
  }

  async createPost(content: string, media?: string[]): Promise<SocialPost> {
    if (!this.connected) throw new Error('Not connected to Facebook')

    const response = await fetch(
      `${this.baseUrl}/${this.userId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          access_token: this.accessToken,
        }),
      }
    )
    const data = await response.json()

    return {
      id: data.id,
      platform: 'facebook',
      content,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      engagement: 0,
      media: media || [],
    }
  }

  async sync(): Promise<void> {
    await this.getProfile()
    await this.getPosts(50)
    await this.getAnalytics(30)
  }

  async getInsights(): Promise<any> {
    const analytics = await this.getAnalytics(30)
    const profile = await this.getProfile()
    
    return {
      profile,
      analytics,
      insights: [
        `You have ${profile.following} friends`,
        `Total engagement: ${analytics.totalEngagement}`,
        `Most engaged post: ${analytics.topPosts[0]?.content.substring(0, 50)}...`,
      ],
    }
  }
}

// TikTok Adapter
export class TikTokAdapter implements ISocialMediaAdapter {
  private baseUrl = 'https://open-api.tiktok.com/v1'
  private accessToken: string = ''
  private userId: string = ''
  private connected: boolean = false

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'tiktok') {
      throw new Error('Invalid integration type for TikTok adapter')
    }

    this.accessToken = config.accessToken || ''
    
    try {
      // Test connection by fetching user info
      const response = await fetch(`${this.baseUrl}/user/info/`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      this.connected = response.ok
      return this.connected
    } catch (error) {
      console.error('TikTok connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getProfile(): Promise<SocialProfile> {
    if (!this.connected) throw new Error('Not connected to TikTok')

    const response = await fetch(`${this.baseUrl}/user/info/?fields=display_name,avatar_url,follower_count,following_count,likes_count,video_count`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    })

    const data = await response.json()
    const user = data.data.user

    return {
      id: user.open_id || 'unknown',
      platform: 'tiktok',
      username: user.display_name || 'TikTok User',
      displayName: user.display_name || 'TikTok User',
      bio: user.bio_description || '',
      profileImage: user.avatar_url || '',
      followers: user.follower_count || 0,
      following: user.following_count || 0,
      verified: user.is_verified || false,
    }
  }

  async getPosts(limit: number = 20): Promise<SocialPost[]> {
    if (!this.connected) throw new Error('Not connected to TikTok')

    const response = await fetch(`${this.baseUrl}/video/list/?fields=id,title,cover_image_url,video_description,duration,height,width,view_count,like_count,comment_count,share_count,create_time`, {
      headers: { 
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ max_count: limit }),
    })

    const data = await response.json()
    
    return (data.data?.videos || []).map((video: any) => ({
      id: video.id,
      platform: 'tiktok',
      content: video.video_description || '',
      timestamp: new Date(video.create_time * 1000),
      likes: video.like_count || 0,
      comments: video.comment_count || 0,
      shares: video.share_count || 0,
      engagement: (video.like_count || 0) + (video.comment_count || 0) + (video.share_count || 0),
      media: [video.cover_image_url],
    }))
  }

  async getAnalytics(days: number = 30): Promise<SocialAnalytics> {
    if (!this.connected) throw new Error('Not connected to TikTok')

    const profile = await this.getProfile()
    const posts = await this.getPosts(50)

    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0)
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0)
    const totalShares = posts.reduce((sum, post) => sum + post.shares, 0)

    return {
      platform: 'tiktok',
      totalPosts: posts.length,
      totalEngagement: totalLikes + totalComments + totalShares,
      averageLikes: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0,
      topPosts: posts.sort((a, b) => b.engagement - a.engagement).slice(0, 5),
      bestPostingTimes: [],
      audienceGrowth: 0,
    }
  }

  async createPost(content: string, media?: string[]): Promise<SocialPost> {
    throw new Error('TikTok posting requires video upload - not supported via simple API')
  }

  async sync(): Promise<void> {
    await this.getProfile()
    await this.getPosts(50)
    await this.getAnalytics(30)
  }

  async getInsights(): Promise<any> {
    const analytics = await this.getAnalytics(30)
    const profile = await this.getProfile()
    
    return {
      profile,
      analytics,
      insights: [
        `${profile.followers.toLocaleString()} followers on TikTok`,
        `Total engagement: ${analytics.totalEngagement.toLocaleString()}`,
        `Average ${analytics.averageLikes} likes per video`,
        `Most viral video: ${analytics.topPosts[0]?.engagement.toLocaleString()} total engagement`,
      ],
    }
  }
}

// YouTube Adapter
export class YouTubeAdapter implements ISocialMediaAdapter {
  private accessToken: string = ''
  private connected = false
  private baseUrl = 'https://www.googleapis.com/youtube/v3'
  private channelId: string = ''

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'youtube') {
      throw new Error('Invalid integration type for YouTube adapter')
    }

    this.accessToken = config.accessToken || ''
    
    try {
      // Get channel info
      const response = await fetch(`${this.baseUrl}/channels?part=snippet,statistics&mine=true`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })
      
      const data = await response.json()
      if (data.items && data.items.length > 0) {
        this.channelId = data.items[0].id
        this.connected = true
        return true
      }
      
      return false
    } catch (error) {
      console.error('YouTube connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
    this.channelId = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getProfile(): Promise<SocialProfile> {
    if (!this.connected) throw new Error('Not connected to YouTube')

    const response = await fetch(
      `${this.baseUrl}/channels?part=snippet,statistics&id=${this.channelId}`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )

    const data = await response.json()
    const channel = data.items[0]

    return {
      id: channel.id,
      platform: 'youtube',
      username: channel.snippet.customUrl || channel.snippet.title,
      displayName: channel.snippet.title,
      bio: channel.snippet.description,
      profileImage: channel.snippet.thumbnails.default.url,
      followers: parseInt(channel.statistics.subscriberCount) || 0,
      following: 0,
      verified: false,
    }
  }

  async getPosts(limit: number = 20): Promise<SocialPost[]> {
    if (!this.connected) throw new Error('Not connected to YouTube')

    // Get uploads playlist
    const channelResponse = await fetch(
      `${this.baseUrl}/channels?part=contentDetails&id=${this.channelId}`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )
    const channelData = await channelResponse.json()
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads

    // Get videos from uploads playlist
    const videosResponse = await fetch(
      `${this.baseUrl}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${limit}`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )
    const videosData = await videosResponse.json()

    // Get video statistics
    const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',')
    const statsResponse = await fetch(
      `${this.baseUrl}/videos?part=statistics&id=${videoIds}`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )
    const statsData = await statsResponse.json()

    return videosData.items.map((item: any, index: number) => {
      const stats = statsData.items[index].statistics
      return {
        id: item.snippet.resourceId.videoId,
        platform: 'youtube',
        content: item.snippet.title,
        timestamp: new Date(item.snippet.publishedAt),
        likes: parseInt(stats.likeCount) || 0,
        comments: parseInt(stats.commentCount) || 0,
        shares: 0,
        engagement: parseInt(stats.likeCount) + parseInt(stats.commentCount) || 0,
        media: [item.snippet.thumbnails.default.url],
      }
    })
  }

  async getAnalytics(days: number = 30): Promise<SocialAnalytics> {
    if (!this.connected) throw new Error('Not connected to YouTube')

    const posts = await this.getPosts(50)
    const profile = await this.getProfile()

    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0)
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0)

    return {
      platform: 'youtube',
      totalPosts: posts.length,
      totalEngagement: totalLikes + totalComments,
      averageLikes: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0,
      topPosts: posts.sort((a, b) => b.engagement - a.engagement).slice(0, 5),
      bestPostingTimes: [],
      audienceGrowth: 0,
    }
  }

  async createPost(content: string, media?: string[]): Promise<SocialPost> {
    throw new Error('YouTube video upload requires complex multipart upload - use YouTube Studio')
  }

  async sync(): Promise<void> {
    await this.getProfile()
    await this.getPosts(50)
    await this.getAnalytics(30)
  }

  async getInsights(): Promise<any> {
    const analytics = await this.getAnalytics(30)
    const profile = await this.getProfile()
    
    return {
      profile,
      analytics,
      insights: [
        `${profile.followers.toLocaleString()} subscribers`,
        `Total engagement: ${analytics.totalEngagement.toLocaleString()}`,
        `Average ${analytics.averageLikes} likes per video`,
        `Most popular video: ${analytics.topPosts[0]?.engagement.toLocaleString()} total engagement`,
      ],
    }
  }
}
