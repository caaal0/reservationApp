import { auth, db } from "./firebase.js";
import { doc, updateDoc } from "firebase/firestore";
import { useAuthStore } from "@/stores/auth";
import { updateProfile, updatePassword, updatePhoneNumber, PhoneAuthProvider } from "firebase/auth";

async function getCustomer(customerId){
  try{
    const response = await fetch(`http://localhost:8080/users/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const data = await response.json()
      console.error('Getting user failed');
      alert('Getting user failed');
      return data;
    }

  } catch (error){
    console.error('Error:', error);
    alert('User retrieval error.');
    return {success: false, error};
  }
}

async function getCustomers(){
  try{
    const response = await fetch('http://localhost:8080/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const data = await response.json()
      console.error('Getting users failed');
      alert('Getting users failed');
      return data;
    }

  } catch (error){
    console.error('Error:', error);
    alert('Users retrieval error.');
    return {success: false, error};
  }
}

async function getCustomersForTable({page, itemsPerPage, sortBy, search}){
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  try{
    const response = await fetch('http://localhost:8080/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      // const totalItems = data.data.length;
      //filters here
      const items = data.data.filter((item) => {

        if(search.name && !item.name.toLowerCase().includes(search.name.toLowerCase())){
          return false;
        }
        if(search.email && !item.email.includes(search.email)){
          return false;
        }
        return true;
      });
      // Apply sorting
      if (sortBy && sortBy.length) {
        const { key, order } = sortBy[0];
        items.sort((a, b) => {
          const aValue = a[key];
          const bValue = b[key];
          if (aValue < bValue) return order === 'asc' ? -1 : 1;
          if (aValue > bValue) return order === 'asc' ? 1 : -1;
          return 0;
        });
      }
      //pagination here
      const paginated = items.slice(start, end);
      return {success: true, data: paginated, totalItems: items.length};
    } else {
      const data = await response.json()
      console.error('Getting users failed');
      alert('Getting users failed');
      return data;
    }

  } catch (error){
    console.error('Error:', error);
    alert('Users retrieval error.');
    return {success: false, error};
  }
}

async function deleteUser(userId){
  try{
    const response = await fetch(`http://localhost:8080/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const data = await response.json()
      console.error('Deleting user failed');
      alert('Deleting user failed');
      return data;
    }

  } catch (error){
    console.error('Error:', error);
    alert('User deletion error.');
    return {success: false, error};
  }
}

async function createStaff({name, email, contactNo, password}){
  try{
    const staffDetails = {
      name: name,
      email: email,
      contactNo: contactNo,
      password: password
    }
    const response = await fetch('http://localhost:8080/staffs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staffDetails)
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const data = await response.json()
      console.error('Creating staff failed');
      alert('Creating staff failed');
      return data;
    }

  } catch (error){
    console.error('Error:', error);
    alert('Staff creation error.');
    return {success: false, error};
  }
}

async function getStaffs(){
  try{
    const response = await fetch('http://localhost:8080/staffs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const data = await response.json()
      console.error('Getting staffs failed');
      alert('Getting staffs failed');
      return data;
    }

  } catch (error){
    console.error('Error:', error);
    alert('Staff retrieval error.');
    return {success: false, error};
  }
}

async function deleteStaff(staffId){
  try{
    const response = await fetch(`http://localhost:8080/staffs/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const data = await response.json()
      console.error('Deleting staff failed');
      alert('Deleting staff failed');
      return data;
    }

  } catch (error){
    console.error('Error:', error);
    alert('Staff deletion error.');
    return {success: false, error};
  }
}

async function updateInfo(oldObj, newObj){
  try{
    const authStore = useAuthStore();
    if(oldObj.email === newObj.email && oldObj.name === newObj.name && oldObj.contact === newObj.contact){
      throw new Error('No changes detected.');
    }
    //make sure someone is signed in
    if(authStore.user){
      await updateProfile(authStore.user, {
        displayName: newObj.name,
      })
    }
    //update contact number in doc only because firebase auth can cost money for larger scales of users
    //try to update user document for customers here
    if(authStore.userRole === 'customer'){
      const customerRef = doc(db, 'customers', authStore.user.uid);
      await updateDoc(customerRef, {
        name: newObj.name,
        email: newObj.email,
        contactNo: newObj.contact,
      });
    //if staff, update staff document
    }else if(authStore.userRole === 'staff'){
      const staffRef = doc(db, 'staffs', authStore.user.uid);
      await updateDoc(staffRef, {
        name: newObj.name,
        email: newObj.email,
        contactNo: newObj.contact,
      });
    }else{
      console.log('Admin info update');
    }

    return {success: true, msg: 'Info updated successfully.'};
  }catch(error){
    console.error(error);
    // alert('Update info error.');
    return {success: false, error};
  }
}

async function changePassword(oldPassword, newPassword){

}

export default {
  getCustomer,
  getCustomers,
  getCustomersForTable,
  deleteUser,
  createStaff,
  getStaffs,
  deleteStaff,
  updateInfo,
  changePassword,
}
