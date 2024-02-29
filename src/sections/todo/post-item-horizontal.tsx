import { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import { CreateTodoInput } from 'src/API';
import { listTodos } from 'src/graphql/queries';
import { deleteTodo } from 'src/graphql/mutations';
import amplifyconfig from 'src/amplifyconfiguration.json';

import Iconify from 'src/components/iconify';
import TextMaxLine from 'src/components/text-max-line';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

Amplify.configure(amplifyconfig);
const client = generateClient();

// ----------------------------------------------------------------------

type Props = {
  post: CreateTodoInput;
};

export default function PostItemHorizontal({ post }: Props) {
  const popover = usePopover();

  const {
    id,
    name,
    description,
  } = post;

  const [todos, setTodos] = useState<CreateTodoInput[]>([]);

  const fetchTodo = async () => {
    try {
      const user = await getCurrentUser();
      const todoData = await client.graphql({
        query: listTodos,
        variables: { filter: { userId: { eq: user?.userId } } },
      });
      setTodos(todoData.data.listTodos.items);
      console.log(todos)
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await client.graphql({
        query: deleteTodo,
        variables: { input: { id: todoId } },
      });
      await fetchTodo();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Stack component={Card} direction="row">
        <Stack
          sx={{
            p: (theme) => theme.spacing(3, 3, 2, 3),
          }}
        >

          <Stack spacing={1} flexGrow={1}>
            <Link color="inherit">
              <TextMaxLine variant="subtitle2" line={2}>
                {name}
              </TextMaxLine>
            </Link>

            <TextMaxLine variant="body2" sx={{ color: 'text.secondary' }}>
              {description}
            </TextMaxLine>
          </Stack>

          <Stack direction="row" alignItems="center">
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-horizontal-fill" />
            </IconButton>

            <Stack
              spacing={1.5}
              flexGrow={1}
              direction="row"
              flexWrap="wrap"
              justifyContent="flex-end"
              sx={{
                typography: 'caption',
                color: 'text.disabled',
              }}
             />
          </Stack>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="bottom-center"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            if (id === "string") {
              handleDeleteTodo(id);
            }
          }}
        >
          <Iconify icon="solar:check-square-linear" />
          Done
        </MenuItem>
      </CustomPopover>
    </>
  );
}
