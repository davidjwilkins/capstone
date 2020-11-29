import React, { useState } from "react";
import {
  Card,
  InputGroup,
  Intent,
  H3,
  Button,
  ButtonGroup
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

function Login({onLogin, onRegister, isLoggingIn, isRegistering}: {onLogin: (username: string, password: string) => any, onRegister: (username: string, password: string) => any, isLoggingIn: boolean, isRegistering: boolean}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <Card title="Login">
      <H3>Login</H3>
      <InputGroup
        leftIcon={IconNames.USER}
        placeholder="Username"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
        value={username}
      />
      <br/>
      <InputGroup
        leftIcon={IconNames.LOCK}
        placeholder="Password"
        type="password"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        value={password}
      />
      <br/>
      <ButtonGroup>
        <Button
          icon={IconNames.LOG_IN}
          intent={Intent.PRIMARY}
          onClick={() => onLogin(username, password)}
          loading={isLoggingIn}
          disabled={isRegistering}
        >
          Login
        </Button>
        <Button
          icon={IconNames.USER}
          intent={Intent.PRIMARY}
          onClick={() => onRegister(username, password)}
          loading={isRegistering}
          disabled={isLoggingIn}
        >
          Register
        </Button>
      </ButtonGroup>
    </Card>
  );
}

export default Login;