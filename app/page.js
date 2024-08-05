'use client'
import Image from "next/image";
import "./page.css";
import { useState, useEffect} from 'react'
import { firestore } from '@/firebase'
import { Box, Typography, Modal, Stack, TextField, Button } from '@mui/material'
import { query, collection, getDocs, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([])
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [toChange, setToChange] = useState("")

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) =>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
    setFilteredInventory(inventoryList)
    

  }
  

  //This will update the items displayed as you type
  const handleSearchChange = async  (e) => {
    const searchVal = e.target.value;
    setSearchText(searchVal); // This lets us see what we are typing inside the search box

    //If the search happens to have some text in it, we need to change what appears on the screen
    //Thus we filter out everything that doesn't contain what is in the search allowing us to present
    //a new array of only the items the user wants.
    //We use toLowerCase because the user might put a capital letter and searching with lowercase and uppercase letters
    //makes it more complicated.
    if (searchVal !== ""){
      const filteredItems = inventory.filter(items =>
        items.name.toLowerCase().includes(searchVal.toLowerCase())
       )

      //By this point filteredItems contains an array of what the user want from their search 
      // so now we set the filteredInventory to filteredItems allowing us to display the filtered items.
      setFilteredInventory(filteredItems);
    }
    //If the search happens to be empty it should display all the items
    //Thus the filtered inventory is now equal to the normal inventory 
    //as there is nothing to filter out
    else{
      setFilteredInventory(inventory);
    };
  }

  const editItem = async (item,amount) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    
    if(docSnap.exists()){
      await setDoc(docRef, {quantity: amount })
    }
    await updateInventory()
    
  }

  const addItem = async (item, amount) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    
    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: (quantity + 1)})
    }
    else{

     if(amount <=0){
      amount = 1;
     }
      await setDoc(docRef, {quantity: amount});
      
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      if(quantity ===  1){
        await deleteDoc(docRef)
      }
      else{
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }

    await updateInventory()
    

  }

  //These are used when we click on a button that opens a mini box to enter info (Modal)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleOpenEdit = (item) =>{
    setOpenEdit(true);
    setToChange(item)
  }
  const handleCloseEdit = () =>{
    
    editItem(toChange,itemQuantity);
    setOpenEdit(false);

  }
  


  useEffect(() => {
    updateInventory()
  }, [])
  
  
  
  return(
        <Box width="100vw" 
             height="100vh" 
             display="flex" 
             flexDirection="column"
             justifyContent="center" 
             alignItems="center"
             gap={2}   
             >
          <Modal open={open} onClose={handleClose}>
            <Box position="absolute" top="50%" left="50%"  bgcolor="white" 
                 border="2px solid black" boxShadow={24} p={4} display="flex" flexDirection="column" gap={3} 
                 sx={{transform:"translate(-50%,-50%)"}}>
              <Typography variant="h6">Add Item</Typography>
              <Stack width="100%" direction="row" spacing={2}>
                <TextField placeholder=""variant="outlined" fullWidth value={itemName} 
                           onChange={(e) => {setItemName(e.target.value)}} label="Item"></TextField>
                <TextField type="number" variant="outlined" fullWidth value={itemQuantity} 
                           onChange={(e) => {setItemQuantity(e.target.value)}} label="Quantity"></TextField>
                <Button variant="outlined" onClick={()=> {
                  addItem(itemName,itemQuantity)
                  setItemName('')
                  setItemQuantity(0)
                  handleClose()
                }} >Add</Button>
              </Stack>
            </Box>

          </Modal>
          <Button variant="contained" onClick={() => {handleOpen()}}> Add New Item</Button>
          <TextField variant="outlined" label="Search" value={searchText} onChange={handleSearchChange}></TextField>
          <Box border="1px solid black">
            <Box width="800px" height="100px" bgcolor="gray">
              <Typography variant="h2" color="black" display="flex" justifyContent="center" 
                          alignItems="center">Inventory Items</Typography>
            </Box>
          
          <Stack width="800px" height="300px" spacing={2} overflow="auto">
            {
              filteredInventory.map(({name,quantity}) => (
                <Box className="each-item" key="name" width="100%" minheight="150px" display="flex" 
                     alingItems="center" justifyContent="space-between" 
                      padding={5}>
                      <Typography variant="h3" color="#333" textAlign="center">
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </Typography>
                      <Typography variant="h3" color="#333" textAlign="center">
                        {quantity}
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={()=>{
                          addItem(name)
                        }}>Add</Button>
                        <Button variant="contained" onClick={()=>{
                          removeItem(name)
                        }}>Remove</Button>
                        <Button variant="contained" onClick={() => 
                        {handleOpenEdit(name);
                          setItemQuantity(0);
                        }}
                        >Edit</Button>
                      </Stack>
                        <Modal open={openEdit} onClose={handleCloseEdit}>
                          <Box position="absolute" top="50%" left="50%"  bgcolor="white" 
                               border="2px solid black" boxShadow={24} p={4} display="flex" flexDirection="column" gap={3} 
                               sx={{transform:"translate(-50%,-50%)"}}>
                            <Typography variant="h6">Edit Item</Typography>
                            <Stack width="100%" direction="row" spacing={2}>
                              <TextField type="number" label="Quantity" placeholder=""variant="outlined" fullWidth value={itemQuantity} 
                                         onChange={(e) => {
                                          setItemQuantity(Number(e.target.value));
                                          }}></TextField>
                              <Button variant="outlined" onClick={()=> {
                                handleCloseEdit()
                              }} >Edit</Button>
                            </Stack>

                          </Box>
                        </Modal>
                  </Box>
              ))
            }
          </Stack>
          </Box>
        </Box>
  )
}
