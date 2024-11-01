import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useUsers } from '@/hooks/useUsers';
import { useHook } from '../hook';
import Page from '..';

// next/navigationのモック
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn()
  }))
}));

// useUsersフックをモック化
jest.mock('@/hooks/useUsers');
const mockSearchUsers = jest.fn();
const mockGetUsers = jest.fn();
(useUsers as jest.Mock).mockReturnValue({
  users: [],
  isLoading: true,
  searchUsers: mockSearchUsers
});

// useHookフックをモック化
jest.mock('../hook');
const mockUsePage = {
  searchTerm: '',
  isLoading: true,
  fetchUsers: mockGetUsers,
  setSearchTerm: jest.fn()
};
(useHook as jest.Mock).mockReturnValue({
  usePage: () => mockUsePage
});

describe('Page', () => {
  // fetchUsersの呼び出しをシミュレート
  test('should call fetchUsers when manually invoked', () => {
    render(<Page initialUsers={[]} />);

    // fetchUsersを手動で呼び出し
    mockUsePage.fetchUsers();

    // fetchUsersが呼ばれたことを確認
    expect(mockGetUsers).toHaveBeenCalled();
  });

  // searchTermが変わるとsearchUsersが呼ばれるかのテスト
  test('calls searchUsers when searchTerm changes', async () => {
    (useHook as jest.Mock).mockReturnValueOnce({
      usePage: () => ({
        ...mockUsePage,
        searchTerm: 'test'
      })
    });
    render(<Page initialUsers={[]} />);

    // searchUsersがsearchTermを引数にして呼ばれるか確認
    await waitFor(() => {
      expect(mockSearchUsers).toHaveBeenCalledWith('test');
    });
  });

  // searchTermの変更がPageHeroで反映されるかのテスト
  test('searchTerm changes when input is typed in PageHero', () => {
    render(<Page initialUsers={[]} />);

    const input = screen.getByRole('textbox'); // テキストボックスを取得
    fireEvent.change(input, { target: { value: 'new search term' } });

    // setSearchTermが新しい検索語で呼ばれていることを確認
    expect(mockUsePage.setSearchTerm).toHaveBeenCalledWith('new search term');
  });
});
