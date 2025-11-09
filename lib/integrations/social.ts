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
      id: user.id,
      platform: 'twitter',
      username: user.username,
      displayName: user.name,
      followers: user.public_metrics.followers_count,
      following: user.public_metrics.following_count,
      bio: user.description,
      profileImage: user.profile_image_url,
      verified: user.verified || false,
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

  async getAnalytics(days = 30): Promise<SocialAnalytics> {
    const posts = await this.getPosts(100)
    const recentPosts = posts.filter(p => 
      p.timestamp > new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    )

    const totalEngagement = recentPosts.reduce((sum, p) => sum + p.engagement, 0)
    const avgLikes = recentPosts.reduce((sum, p) => sum + p.likes, 0) / recentPosts.length || 0

    const topPosts = [...recentPosts]
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5)

    return {
      platform: 'twitter',
      totalPosts: recentPosts.length,
      totalEngagement,
      averageLikes: Math.round(avgLikes),
      topPosts,
      bestPostingTimes: ['9:00 AM', '12:00 PM', '5:00 PM'], // Would calculate from data
      audienceGrowth: 0, // Would need historical data
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
    this.userId = config.userId || ''
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
      username: data.username,
      displayName: data.username,
      bio: '',
      followersCount: data.followers_count || 0,
      followingCount: data.follows_count || 0,
      postsCount: data.media_count || 0,
      verified: false,
      avatarUrl: '',
      platform: 'instagram',
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
      content: post.caption || '',
      createdAt: new Date(post.timestamp),
      likes: post.like_count || 0,
      comments: post.comments_count || 0,
      shares: 0,
      views: 0,
      mediaUrls: [post.media_url],
      platform: 'instagram' as const,
      url: post.permalink,
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
      period: { start: new Date(Date.now() - days * 24 * 60 * 60 * 1000), end: new Date() },
      impressions: 0,
      engagement: totalLikes + totalComments + totalShares,
      reach: profile.followersCount,
      followers: profile.followersCount,
      topPosts: posts.sort((a, b) => b.likes - a.likes).slice(0, 5),
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
      content,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      mediaUrls: media,
      platform: 'instagram',
      url: '',
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
        `You have ${profile.followersCount} followers`,
        `Average engagement: ${(analytics.engagement / profile.postsCount).toFixed(1)} per post`,
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
    this.userId = config.userId || ''
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
      username: '',
      displayName: `${data.localizedFirstName} ${data.localizedLastName}`,
      bio: '',
      followersCount: 0,
      followingCount: connectionsData.paging?.total || 0,
      postsCount: 0,
      verified: false,
      avatarUrl: data.profilePicture?.displayImage || '',
      platform: 'linkedin',
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
      content: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
      createdAt: new Date(post.created?.time || Date.now()),
      likes: post.numLikes || 0,
      comments: post.numComments || 0,
      shares: post.numShares || 0,
      views: 0,
      mediaUrls: [],
      platform: 'linkedin' as const,
      url: `https://www.linkedin.com/feed/update/${post.id}`,
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
      period: { start: new Date(Date.now() - days * 24 * 60 * 60 * 1000), end: new Date() },
      impressions: 0,
      engagement: totalLikes + totalComments + totalShares,
      reach: profile.followingCount,
      followers: profile.followersCount,
      topPosts: posts.sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)).slice(0, 5),
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
      content,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      mediaUrls: media || [],
      platform: 'linkedin',
      url: `https://www.linkedin.com/feed/update/${data.id}`,
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
        `You have ${profile.followingCount} connections`,
        `Total engagement: ${analytics.engagement}`,
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
      username: data.id,
      displayName: data.name,
      bio: '',
      followersCount: 0,
      followingCount: data.friends?.summary?.total_count || 0,
      postsCount: data.posts?.data?.length || 0,
      verified: false,
      avatarUrl: data.picture?.data?.url || '',
      platform: 'facebook',
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
      content: post.message || '',
      createdAt: new Date(post.created_time),
      likes: post.likes?.summary?.total_count || 0,
      comments: post.comments?.summary?.total_count || 0,
      shares: post.shares?.count || 0,
      views: 0,
      mediaUrls: [],
      platform: 'facebook' as const,
      url: `https://www.facebook.com/${post.id}`,
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
      period: { start: new Date(Date.now() - days * 24 * 60 * 60 * 1000), end: new Date() },
      impressions: 0,
      engagement: totalLikes + totalComments + totalShares,
      reach: profile.followingCount,
      followers: profile.followersCount,
      topPosts: posts.sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)).slice(0, 5),
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
      content,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      mediaUrls: media || [],
      platform: 'facebook',
      url: `https://www.facebook.com/${data.id}`,
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
        `You have ${profile.followingCount} friends`,
        `Total engagement: ${analytics.engagement} across all posts`,
        `Most engaged post: ${analytics.topPosts[0]?.content.substring(0, 50)}...`,
      ],
    }
  }
}
