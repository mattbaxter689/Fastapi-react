import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Flex,
    Input,
    InputGroup,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    useDisclosure
} from "@chakra-ui/core";

const TodosContext = React.createContext({
  todos: [], fetchTodos: () => {}
})

//This will add a todo on the frontend and send the post request to the backend to update
function AddTodo() {
  const [item, setItem] = React.useState("")
  const {todos, fetchTodos} = React.useContext(TodosContext)

  const handleInput = event  => {
    setItem(event.target.value)
  }

  const handleSubmit = (event) => {
    const newTodo = {
      "id": todos.length + 1,
      "item": item
    }

    fetch("http://localhost:8000/todo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo)
    }).then(fetchTodos)
  }

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup size="md">
        <Input
          pr="4.5rem"
          type="text"
          placeholder="Add a todo item"
          aria-label="Add a todo item"
          onChange={handleInput}
        />
      </InputGroup>
    </form>
  )
}

//this will allow us to update todos that we want using a put
function UpdateTodo({item, id}) {
  const {isOpen, onOpen, onClose} = useDisclosure()
  const [todo, setTodo] = useState(item)
  const {fetchTodos} = React.useContext(TodosContext)

  const updateTodo = async () => {
    await fetch(`http://localhost:8000/todo/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: todo })
    })
    onClose()
    await fetchTodos()
  }

  return (
    <>
      <Button h="1.5rem" size="sm" onClick={onOpen}>Update Todo</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>Update Todo</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                type="text"
                placeholder="Add a todo item"
                aria-label="Add a todo item"
                value={todo}
                onChange={e => setTodo(e.target.value)}
              />
            </InputGroup>
          </ModalBody>

          <ModalFooter>
            <Button h="1.5rem" size="sm" onClick={updateTodo}>Update Todo</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

function DeleteTodo({id}) {
  const {fetchTodos} = React.useContext(TodosContext)

  const deleteTodo = async () => {
    await fetch(`http://localhost:8000/todo/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: { "id": id }
    })
    await fetchTodos()
  }

  return (
    <Button h="1.5rem" size="sm" onClick={deleteTodo}>Delete Todo</Button>
  )
}

// just to help with the style of the final thing we are exporting. Makes it consistent with what was there before
function TodoHelper({item, id, fetchTodos}) {
  return (
    <Box p={1} shadow="sm">
      <Flex justify="space-between">
        <Text mt={4} as="div">
          {item}
          <Flex align="end">
            <UpdateTodo item={item} id={id} fetchTodos={fetchTodos}/>
            <DeleteTodo id={id} fetchTodos={fetchTodos}/>
          </Flex>
        </Text>
      </Flex>
    </Box>
  )
}


// this is the main thing that will be rendered in the app itself. 
export default function Todos() {
  const [todos, setTodos] = useState([])
  const fetchTodos = async () => {
    const response = await fetch("http://localhost:8000/todo")
    const todos = await response.json()
    setTodos(todos.data)
  }
  useEffect(() => {
    fetchTodos()
  }, [])
  return (
    <TodosContext.Provider value={{todos, fetchTodos}}>
      <AddTodo /> {/* new */}
      <Stack spacing={5}>
        {todos.map((todo) => (
          <TodoHelper item={todo.item} id={todo.id} fetchTodos={fetchTodos} />
        ))}
      </Stack>
    </TodosContext.Provider>
  )
}
