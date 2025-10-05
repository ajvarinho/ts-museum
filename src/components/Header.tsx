import '../css/header.css';

interface HeaderProps {
    isLoading: boolean;
}


const Header: React.FC<HeaderProps> = ({ isLoading }) => {
    // accept message - loaded

    return(
        <header>
            <h1 className={'title' + (isLoading ? '' : ' loaded')}>
                MUSEO
            </h1>

            <button>collection</button>
        </header>
    )
}

export default Header;