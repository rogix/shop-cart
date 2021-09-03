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

  // useEffect(() => {
  //   localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
  // }, [cart])

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart]

      const productExists = updatedCart.find(product => product.id === productId)

      const { data: stock } = await api.get<Stock>(`/stock/${productId}`)

      const stockAmount = stock.amount
      const currentAmount = productExists ? productExists.amount : 0
      const amount = currentAmount + 1

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque')

        return
      }

      if (productExists) {
        productExists.amount = amount
      } else {
        const product = await api.get(`/products/${productId}`)

        const newProduct = {
          ...product.data,
          amount: 1
        }

        updatedCart.push(newProduct)
      }
      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na adição do produto')
    }
  }

  const removeProduct = (productId: number) => {
    try {
      const isPoductOnCart = cart.some(product => product.id === productId)

      if (!isPoductOnCart) {
        toast.error('Erro ao tentar remover produto')
      }

      const cartWithoutRemovedProduct = cart.filter(product => product.id !== productId)

      setCart(cartWithoutRemovedProduct)
    } catch {
      toast.error('Erro ao tentar remover produto')
    }
  }

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      const productIndex = cart.findIndex(product => product.id === productId)

      if (productIndex < 0) {
        toast.error('Erro ao tentar atualizar o produto')
      }

      if (amount < 0) {
        toast.error('Erro ao tentar atualizar o produto')
      }
    } catch {
      toast.error('Erro ao tentar atualizar o produto')
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
