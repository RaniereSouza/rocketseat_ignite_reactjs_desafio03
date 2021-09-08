import  { 
          createContext, 
          ReactNode, 
          useContext, 
          useState 
        }         from 'react';
import  { toast } from 'react-toastify';

import { Product, ProductDisplay, Stock } from '../types';

import { api } from '../services/api';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmountParams {
  productId: number;
  amount:    number;
}

interface CartContextData {
  cart:                  Product[];
  addProductToCart:      (productId: number) => Promise<void>;
  removeProductFromCart: (productId: number) => void;
  updateProductAmount:   ({ productId, amount }: UpdateProductAmountParams) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const updateStoragedCart = (updatedCart: Product[]) => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
  };

  const addProductToCart = async (productId: number) => {
    try {
      const productInCart = cart.find(({ id }) => (id === productId));

      if (productInCart) {
        updateProductAmount({
          productId, 
          amount: productInCart.amount + 1
        });
        return;
      }

      const { data:product }  = await api.get<ProductDisplay>(`products/${productId}`);
      const updatedCart       = [...cart, {
                                  ...product,
                                  amount: 1
                                }];

      setCart(updatedCart);
      updateStoragedCart(updatedCart);
    }
    catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProductFromCart = (productId: number) => {
    try {
      const productInCart = cart.find(({ id }) => (id === productId));

      if (productInCart) {
        const updatedCart = [...cart].filter(({ id }) => (id !== productId));

        setCart(updatedCart);
        updateStoragedCart(updatedCart);
        return;
      }

      throw Error('Produto não existe no carrinho!');
    }
    catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmountParams) => {
    if (amount <= 0) return;

    try {
      const { data:productStock } = await api.get<Stock>(`stock/${productId}`);

      if (amount > productStock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      let   productIndex  = -1;
      const productInCart = cart.find(({ id }, index) => {
                              if (id === productId) {
                                productIndex = index;
                                return true;
                              }
                              return false;
                            });

      if (productInCart) {
        let updatedCart = [...cart];
        updatedCart.splice(productIndex, 1, {
          ...productInCart,
          amount
        });
        
        setCart(updatedCart);
        updateStoragedCart(updatedCart);
        return;
      }

      addProductToCart(productId);
    }
    catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart, 
        addProductToCart, 
        removeProductFromCart, 
        updateProductAmount 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
