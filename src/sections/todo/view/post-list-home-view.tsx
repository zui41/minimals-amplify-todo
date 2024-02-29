'use client';

import orderBy from 'lodash/orderBy';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useDebounce } from 'src/hooks/use-debounce';

import { CreateTodoInput } from 'src/API';
import { POST_SORT_OPTIONS } from 'src/_mock';
import { useSearchPosts } from 'src/api/blog';
import { listTodos } from 'src/graphql/queries';
import amplifyconfig from 'src/amplifyconfiguration.json';

import { useSettingsContext } from 'src/components/settings';

import PostList from '../post-list';
import PostSort from '../post-sort';
import PostSearch from '../post-search';

Amplify.configure(amplifyconfig);
const client = generateClient();

// ----------------------------------------------------------------------

export default function PostListHomeView() {
  const settings = useSettingsContext();

  const [sortBy, setSortBy] = useState('latest');

  const [searchQuery, setSearchQuery] = useState('');

  const debouncedQuery = useDebounce(searchQuery);

  const { searchResults, searchLoading } = useSearchPosts(debouncedQuery);

  const [todos, setTodos] = useState<CreateTodoInput[]>([]);
  const fetchTodo = async () => {
    try {
      console.log(1)
      const userId = await getCurrentUser();
      const todoData = await client.graphql({
        query: listTodos,
        variables: { filter: { userId: { eq: userId ?? null } } },
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
      console.log(setTodos(todos));
      console.log(todos)
    } catch (error) {
      console.log(2)
      console.error(error);
    }
  };
  useEffect(() => {
    fetchTodo();
  }, []);

  const dataFiltered = applyFilter({
    inputData: todos,
    sortBy,
  });

  const handleSortBy = useCallback((newValue: string) => {
    setSortBy(newValue);
  }, []);

  const handleSearch = useCallback((inputValue: string) => {
    setSearchQuery(inputValue);
  }, []);
  console.log(todos);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Typography
                sx={{
          my: { xs: 3, md: 5 },
        }}
      >
        Blog
      </Typography>

      <Stack
        spacing={3}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        <PostSearch
          query={debouncedQuery}
          results={searchResults}
          onSearch={handleSearch}
          loading={searchLoading}
          hrefItem={(title: string) => paths.post.details(title)}
        />

        <PostSort sort={sortBy} onSort={handleSortBy} sortOptions={POST_SORT_OPTIONS} />
      </Stack>

      <PostList todos={dataFiltered} />
    </Container>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData, sortBy }: { inputData: CreateTodoInput[]; sortBy: string }) => {
  if (sortBy === 'latest') {
    return orderBy(inputData, ['createdAt'], ['desc']);
  }

  if (sortBy === 'oldest') {
    return orderBy(inputData, ['createdAt'], ['asc']);
  }

  if (sortBy === 'popular') {
    return orderBy(inputData, ['totalViews'], ['desc']);
  }

  return inputData;
};
