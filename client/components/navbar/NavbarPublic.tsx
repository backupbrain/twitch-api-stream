import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

export type Props = {
  user?: any; // TODO: make this a "user" object
};
export default function NavbarPublic(props: Props) {
  return (
    <Navbar>
      <Navbar.Brand href="/">Company</Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="me-auto">
          {!props.user && <Nav.Link href="/account/login">Login</Nav.Link>}
          {!props.user && (
            <Nav.Link href="/account/create">Create account</Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
