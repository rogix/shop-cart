import { useEffect } from 'react'
import { createContext, ReactNode, useContext, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '../services/api'
import { Product, Stock } from '../types'

interface CartProviderProps {
  children: ReactNode
}

interface UpdateProductAmount {
  productId: number
  amount: number
}

interface CartContextData {
  cart: Product[]
  addProduct: (productId: number) => Promise<void>
  removeProduct: (productId: number) => void
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void
}

const CartContext = createContext<CartContextData>({} as CartContextData)

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RockerShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart)
    }

    return []
  })

  useEffect(() => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
  })

  const addProduct = async (productId: number) => {
    try {
      const { data: stock } = await api.get<Stock>(`/stock/${productId}`)

      const productIndex = cart.findIndex(product => product.id === productId)

      const isPoductOnCart = productIndex >= 0
      const isProductOutOfCart = productIndex < 1

      if (isPoductOnCart) {
        const productAmount = cart[productIndex].amount + 1

        if (stock.amount < productAmount) {
          toast.error('Quantidade solicitada fora de estoque')

          return
        }

        const newCart = cart.map(product => {
          if (product.id === productId) {
            return { ...product, amount: productAmount }
          }

          return product
        })

        setCart(newCart)
      } else {
        if (isProductOutOfCart) {
          toast.error('Quantidade solicitada fora de estoque')
        }
      }
    } catch {
      toast.error('Erro na adição do produto')
    }
  }

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  }

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  }

  return (
    <CartContext.Provider value={{ cart, addProduct, removeProduct, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextData {
  const context = useContext(CartContext)

  return context
}
