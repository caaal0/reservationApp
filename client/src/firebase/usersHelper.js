

async function getUsersForTable({page, itemsPerPage, sortBy, search}){
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

export default {
  getUsersForTable,
  deleteUser,
  createStaff,
  getStaffs,
  deleteStaff,
}
