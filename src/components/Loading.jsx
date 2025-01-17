import '../styles/Loading.css';

const Loading = () => {
    return (
        <div className="loading-container" role="status">
            <i className="fas fa-spinner fa-spin fa-3x"></i>
        </div>
    );
};

export default Loading;