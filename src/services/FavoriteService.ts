export interface FavoriteRequest {
  id: string
  name: string
  type: 'http' | 'rpc'
  protocol: string
  url: string
  method: string
  rpcMethod?: string
  params: string
  headers: Header[]
}

export class FavoriteService {
  private static instance: FavoriteService
  private readonly FAVORITES_KEY = 'favorite_requests'

  private constructor() {}

  public static getInstance(): FavoriteService {
    if (!FavoriteService.instance) {
      FavoriteService.instance = new FavoriteService()
    }
    return FavoriteService.instance
  }

  public getFavorites(): FavoriteRequest[] {
    const favorites = localStorage.getItem(this.FAVORITES_KEY)
    return favorites ? JSON.parse(favorites) : []
  }

  public saveFavorite(request: Omit<FavoriteRequest, 'id'>) {
    const favorites = this.getFavorites()
    const newFavorite: FavoriteRequest = {
      ...request,
      id: Date.now().toString()
    }
    favorites.push(newFavorite)
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites))
  }

  public deleteFavorite(id: string) {
    const favorites = this.getFavorites().filter(f => f.id !== id)
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites))
  }
}

export default FavoriteService.getInstance() 