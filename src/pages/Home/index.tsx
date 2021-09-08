import { useState, useEffect } from 'react';
import { MdAddShoppingCart }   from 'react-icons/md';

import { ProductDisplay } from '../../types';

import { formatPrice } from '../../util/format';

import { api } from '../../services/api';

import { useCart } from '../../hooks/useCart';

import { ProductList } from './styles';

interface ProductFormatted extends ProductDisplay {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [ products, setProducts ]  = useState<ProductFormatted[]>([]);
  const { addProductToCart, cart } = useCart();

  useEffect(() => {
    async function loadProducts() {
      const { data:products } = await api.get<ProductDisplay[]>('products');

      setProducts(products.map<ProductFormatted>(item => {
        return {
          ...item,
          priceFormatted: formatPrice(item.price)
        };
      }));
    }

    loadProducts();
  }, []);

  
  function handleAddProductToCart(id: number) {
    addProductToCart(id);
  }
  
  const cartItemsAmount = cart.reduce((sumAmount, { id, amount }) => {
    return {
      ...sumAmount, 
      [id]: amount
    };
  }, {} as CartItemsAmount);

  return (
    <ProductList>
      {(products.length > 0) && products.map(({ id, image, title, priceFormatted }) => (
        <li key={id}>
          <img src={image} alt={title} />
          <strong>{title}</strong>
          <span>{priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProductToCart(id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[id] || 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
