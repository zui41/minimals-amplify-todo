'use client';

import { Amplify } from 'aws-amplify';
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { CreateTodoInput } from 'src/API';
import { listTodos } from 'src/graphql/queries';
import amplifyconfig from 'src/amplifyconfiguration.json';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import PostListHorizontal from '../post-list-horizontal';

Amplify.configure(amplifyconfig);
const client = generateClient();

// ----------------------------------------------------------------------


export default function PostListView() {
  const settings = useSettingsContext();

  const [todos, setTodos] = useState<CreateTodoInput[]>([]);

  const fetchTodo = async () => {
    try {
      const user = await getCurrentUser();
      const todoData = await client.graphql({
        query: listTodos,
        variables: { filter: { userId: { eq: user?.userId } } },
      });
      setTodos(todoData.data.listTodos.items);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTodo();
  });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="List"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Todo',
            href: paths.dashboard.todo.root,
          },
          {
            name: 'List',
          },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.post.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Post
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PostListHorizontal posts={todos} />
    </Container>
  );
}
