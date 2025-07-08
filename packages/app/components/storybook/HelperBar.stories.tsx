import React from 'react';
import { View } from 'react-native';
import { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@app/core/logic/theme';
import { HelperBar } from '../HelperBar';

const meta: Meta<typeof HelperBar> = {
  title: 'Components/HelperBar',
  component: HelperBar,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <ThemeProvider>
          <View style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
            <Story />
          </View>
        </ThemeProvider>
      </BrowserRouter>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'HelperBar component with business logic extracted to useHelperBar hook. Handles navigation, refresh functionality, and dynamic button text based on current category.',
      },
    },
  },
  argTypes: {
    // No props needed as the component uses the hook internally
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default HelperBar with credentials category. Shows "Ajouter un identifiant" button.',
      },
    },
  },
};

export const BankCardsCategory: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'HelperBar in bank cards category. Shows "Ajouter une carte" button.',
      },
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <ThemeProvider>
          <View style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
            <Story />
          </View>
        </ThemeProvider>
      </BrowserRouter>
    ),
  ],
};

export const SecureNotesCategory: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'HelperBar in secure notes category. Shows "Ajouter une note" button.',
      },
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <ThemeProvider>
          <View style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
            <Story />
          </View>
        </ThemeProvider>
      </BrowserRouter>
    ),
  ],
};

export const WithRefreshFunctionality: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'HelperBar with refresh functionality. The refresh button will reload items from the server.',
      },
    },
  },
};

export const WithFAQFunctionality: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'HelperBar with FAQ functionality. The FAQ button will navigate to help section.',
      },
    },
  },
}; 