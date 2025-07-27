# Storybook Configuration

## Custom Viewport Configuration

This Storybook instance is configured with a custom viewport that matches the Chrome Extension popup dimensions.

### Default Viewport
- **Name**: Chrome Extension Popup
- **Dimensions**: 350px × 550px
- **Type**: Mobile

### Available Viewports
1. **Chrome Extension Popup** (Default) - 350px × 550px
2. **Mobile** - 375px × 667px
3. **Tablet** - 768px × 1024px
4. **Standard Storybook viewports** (Desktop, Mobile, etc.)

### How to Use

#### For All Stories (Default)
All stories automatically use the Chrome Extension Popup viewport by default. This ensures consistent testing across your component library.

#### For Individual Stories
If you need to test a specific story with a different viewport, you can override it in the story:

```tsx
export const MyStory = () => <MyComponent />;
MyStory.parameters = {
  viewport: {
    defaultViewport: 'mobile'
  }
};
```

#### For Component Groups
You can set viewport parameters for entire component groups:

```tsx
export default {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    }
  }
};
```

### Viewport Controls
- Use the viewport dropdown in the Storybook toolbar to switch between viewports
- The Chrome Extension Popup viewport is set as the default
- You can still access all standard Storybook viewports when needed

### CSS Classes
The custom viewport is styled with:
- Fixed dimensions: 350px × 550px
- Centered with auto margins
- Border for visual separation
- Rounded corners
- Hidden overflow

This ensures your components are tested in an environment that closely matches the actual Chrome Extension popup. 