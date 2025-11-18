import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import { Provider } from 'react-redux';
import RouteProvider from '@app/providers/RouteProvider';
import store from './providers/store';
import { Spin, ConfigProvider } from 'antd';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemSelectedBg: '#0A2A79', // nền khi selected
              itemSelectedColor: '#ffffff',
              itemBorderRadius: 12, // bo góc
              itemHoverBg: '#E8EDF7', // hover theo style nhẹ
            },
          },
          token: {
            colorPrimary: '#0A2A79',
            borderRadius: 8,
          },
        }}
      >
        <Suspense
          fallback={
            <Spin size='large' className='h-screen flex justify-center' />
          }
        >
          <RouteProvider />
        </Suspense>
      </ConfigProvider>
    </QueryClientProvider>
  </Provider>
);
