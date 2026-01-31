<button onClick={() => {
  localStorage.removeItem("token");
  setToken(null);
}}>
  Se déconnecter
</button>
