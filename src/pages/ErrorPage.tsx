import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

function ErrorPage() {
    const error = useRouteError();

    let errorMessage: string;
    if (isRouteErrorResponse(error)) {
        errorMessage = error.statusText;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else {
        errorMessage = 'Unknown error';
    }

    return (
        <div>
            <h1>Oops</h1>
            <p>Sorry an unexpected error occoured</p>
            <p>
                <i>{errorMessage}</i>
            </p>
        </div>
    );
}

export default ErrorPage;
