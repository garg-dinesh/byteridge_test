import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { userActions } from '../_actions';
import { TableHeader, Paging, Search } from "../_components";

import { Navbar, Nav, Table, Dropdown, DropdownButton } from 'react-bootstrap';
import './Audit.css';

const Auditpage = (props) => {
    const [users,setUsersData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sorting, setSorting] = useState({ field: "", order: "" });
    const [selectedTimeFormat, setselectedTimeFormat] = useState("24hr");

    const ITEMS_PER_PAGE = 50;

    useEffect(() => {
        props.getUsers();
    },[]);

    useEffect(()=>{
        setUsersData(props.users);
    },[props.users]);

    const userData = useMemo(() => {
        if(users.items){
        let _users = users.items;

        //Searching users
        if (search) {
            _users = _users.filter(
                user =>
                    user.id.toLowerCase().includes(search.toLowerCase()) ||
                    user.firstName.toLowerCase().includes(search.toLowerCase()) ||
                    user.lastName.toLowerCase().includes(search.toLowerCase()) ||
                    user.role.toLowerCase().includes(search.toLowerCase()) ||
                    user.role.toLowerCase().includes(search.toLowerCase()) 
            );
        }
        setTotalItems(_users.length);

        //Sorting users
        if (sorting.field) {
            const reversed = sorting.order === "asc" ? 1 : -1;
            _users = _users.sort(
                (a, b) =>
                    reversed * a[sorting.field].localeCompare(b[sorting.field])
            );
        }

        //Current Page slice
        return _users.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
        );
    }
}, [users.items, currentPage, search, sorting]);

    //Delete user
    const handleDeleteUser = (id) => props.deleteUser(id);

    //Select time format type
    const handleDateTimeFormatChange = (type) => {
        setselectedTimeFormat(type);
    }

    //Convert required date time format
    const formatDate = (dateString) => {
        const date_obj = new Date(dateString);
        const date = date_obj.toLocaleDateString();

        if (selectedTimeFormat === "12hr") {
            var time = date_obj.toLocaleTimeString("en-us");
        } else {
            var time = date_obj.toLocaleTimeString();
        }
        return `${date} - ${time}`;
    }

    const headers = [
        { name: "Id", field: "id", sortable: true },
        { name: "Role", field: "role", sortable: false },
        { name: "Created Date", field: "createdDate", sortable: false },
        { name: "First Name", field: "firstName", sortable: false },
        { name: "Last Name", field: "lastName", sortable: false },
        { name: "Delete", field: "delete", sortable: false }
    ];

    return (
        <div>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand ></Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link><Link to="/">Home</Link></Nav.Link>
                    <Nav.Link><Link to="/Audit">Auditor</Link></Nav.Link>
                    <Nav.Link> <Link to="/login">Logout</Link></Nav.Link>
                </Nav>
            </Navbar>

            <div>
                <h2 className="alert alert-success top-margin">
                    Hi {props.user && props.user.firstName}!
                </h2>
                <p className="text text-muted">You're logged in with React!!</p>
                <h3 className="text text-primary">All login audit :</h3>
                <h4 className="text text-warning"> Click On Id to Sort by IDs </h4>
                {users.loading && <em>Loading users...</em>}
                {users.error && <span className="text-danger">ERROR: {users.error}</span>}
                {userData &&
                    <div className="row w-100">
                        <div className="col mb-3 col-12 text-center">
                            <div className="row">
                                <div className="col-md-10">
                                    <Paging
                                        total={totalItems}
                                        itemsPerPage={ITEMS_PER_PAGE}
                                        currentPage={currentPage}
                                        onPageChange={page => setCurrentPage(page)}
                                    />
                                </div>
                                <div className="col-md-2 d-flex flex-row-reverse">
                                    <Search
                                        onSearch={value => {
                                            setSearch(value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {userData &&
                    <div className="bottom-margin">
                        <DropdownButton id="dropdown-basic-button"
                            title={`Select Date/Time Format: ${selectedTimeFormat}`}
                            onSelect={handleDateTimeFormatChange}
                        >
                            <Dropdown.Item eventKey="12hr">12hr</Dropdown.Item>
                            <Dropdown.Item eventKey="24hr">24hr</Dropdown.Item>
                        </DropdownButton>
                    </div>
                }

                {userData &&
                    <Table striped bordered hover>
                        <TableHeader
                            headers={headers}
                            onSorting={(field, order) =>
                                setSorting({ field, order })
                            }
                        />
                        <tbody>
                            {userData.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.role}</td>
                                    <td>{formatDate(user.createdDate)}</td>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>
                                        { user.deleting ? <em> - Deleting...</em>
                                            : user.deleteError ? 
                                                <span className="text-danger">
                                                    - ERROR: {user.deleteError}
                                                </span>
                                                : <span>
                                                    <button className="btn btn-danger"
                                                        onClick={()=>handleDeleteUser(user.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                }
            </div>
        </div>
    );
}

function mapState(state) {
    const { users, authentication } = state;
    const { user } = authentication;
    return { user, users };
}

const actionCreators = {
    getUsers: userActions.getAll,
    deleteUser: userActions.delete
}

const connectedAuditPage = connect(mapState, actionCreators)(Auditpage);
export { connectedAuditPage as Auditpage };