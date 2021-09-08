import { BrowserRouter }  from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Routes from './routes';

import { CartProvider } from './hooks/useCart';

import Header from './components/Header';

import GlobalStyles from './styles/global';

export const App = (): JSX.Element => {
  return (
    <>
      <GlobalStyles />
      <BrowserRouter>
        <CartProvider>
          <Header />
          <Routes />
          <ToastContainer autoClose={3000} />
        </CartProvider>
      </BrowserRouter>
    </>
  );
};
