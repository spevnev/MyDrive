import React, {useState} from "react";
import logo from "assets/logo.svg";
import {Header, Logo, Page, Title, Wrapper} from "./index.styles";
import Form, {FormInput} from "./Form";
import {useNavigate} from "react-router-dom";
import LinkButton from "components/LinkButton";
import {useMutation} from "@apollo/client";
import {LOGIN_MUTATION, SIGNUP_MUTATION} from "./index.queries";

type LoginData = {
	username: string;
	password: string;
}

type SignupData = {
	username: string;
	password: string;
	confirmPassword: string;
}

const initialLoginData: LoginData = {username: "", password: ""};
const loginInputs: FormInput[] = [
	{name: "username", placeholder: "Username", maxLength: 30, errorMessage: "Username must be between 4 - 30 characters long!"},
	{name: "password", placeholder: "Password", maxLength: 128, errorMessage: "Password must be between 4 - 128 characters long!", type: "password"},
];

const initialSignupData: SignupData = {username: "", password: "", confirmPassword: ""};
const signupInputs: FormInput[] = [
	...loginInputs,
	{name: "confirmPassword", maxLength: 128, errorMessage: "Passwords don't match!", placeholder: "Confirm password", type: "password"},
];

type LoginProps = {
	checkAuthentication: Function | undefined;
}

const LoginPage = ({checkAuthentication = () => {}}: LoginProps) => {
	const navigate = useNavigate();
	const [isLoginShown, setIsLoginShown] = useState(true);
	const [signupMutation] = useMutation(SIGNUP_MUTATION);
	const [loginMutation] = useMutation(LOGIN_MUTATION);


	const goToMainPage = () => {
		checkAuthentication();
		navigate("/");
	};

	const signup = async (formData: SignupData, showError: Function) => {
		const {username, password, confirmPassword} = formData;
		if (username.length < 4 || username.length > 30) return showError(1);
		if (password.length < 4 || password.length > 128) return showError(2);
		if (password !== confirmPassword) return showError(3);

		try {
			const data = await signupMutation({variables: {username, password}});
			if (!data.data) return;
			const {token, error} = data.data.signup;
			if (error) {
				showError(1, error);
				return;
			}

			localStorage.setItem("JWT", token);
			goToMainPage();
		} catch (e) {}
	};

	const login = async (formData: LoginData, showError: Function) => {
		const {username, password} = formData;
		if (username.length < 4 || username.length > 30) return showError(1);
		if (password.length < 4 || password.length > 128) return showError(2);

		try {
			const data = await loginMutation({variables: {username, password}});
			if (!data.data) return;
			const {token, error} = data.data.login;
			if (error) {
				showError(2, error);
				return;
			}

			localStorage.setItem("JWT", token);
			goToMainPage();
		} catch (e) {}
	};


	return (
		<Page>
			<Header>
				<Logo src={logo}/>
				<Title>My Drive</Title>
			</Header>
			{window.innerWidth > 450 ?
				<Wrapper>
					<Form inputs={loginInputs} initialFormData={initialLoginData} submitForm={login}
						  background="#fdfdfd" color="#000" title="Login" buttonText="Login"/>
					<Form inputs={signupInputs} initialFormData={initialSignupData} submitForm={signup}
						  background="#4444fb" color="#fff" title="Signup" buttonText="Signup"/>
				</Wrapper>
				:
				<Wrapper>
					{isLoginShown ?
						<Form inputs={loginInputs} initialFormData={initialLoginData} background="#fdfdfd" color="#000" title="Login" buttonText="Login" submitForm={login}
							  subTitle={<>Don't have an Account yet?<LinkButton onClick={() => setIsLoginShown(false)}>Sign up</LinkButton></>}/>
						:
						<Form inputs={signupInputs} initialFormData={initialSignupData} submitForm={signup} background="#4444fb" color="#fff" title="Signup" buttonText="Signup"
							  subTitle={<>Already have an Account?<LinkButton onClick={() => setIsLoginShown(true)}>Log in</LinkButton></>}/>
					}
				</Wrapper>
			}
		</Page>
	);
};

export default LoginPage;