import { render, screen } from '@testing-library/react';
import Page from './page';

it('renders the landing heading', () => {
  render(<Page />);
  expect(screen.getByRole('heading')).toBeInTheDocument();
});
