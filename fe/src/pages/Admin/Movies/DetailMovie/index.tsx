import instance from "@/configs/axios";
import { Movie } from "@/interfaces/Movie";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [countries, setCountries] = useState<{ _id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await instance.get(`movie/${id}`);
        setMovie(response.data.data);
      } catch (err) {
        setError("Failed to fetch movie details");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await instance.get("category");
        setCategories(response.data.movie);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    const fetchCountries = async () => {
      try {
        const response = await instance.get("country");
        setCountries(response.data.country);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };

    fetchMovie();
    fetchCategories();
    fetchCountries();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!movie) return <div>No movie found</div>;

  const categoryNames = movie.category
    ? movie.category.map((id) => {
        const category = categories.find((cat) => cat._id === id);
        return category ? category.name : "Unknown";
      })
    : [];

  const countryNames = movie.country
    ? movie.country.map((id) => {
        const country = countries.find((cat) => cat._id === id);
        return country ? country.name : "Unknown";
      })
    : [];

  return (
    <section className="flex flex-col md:flex-row bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <div className="mr-6">
        <img
          className="w-48 h-auto rounded-lg"
          src={movie.thumbnail}
          alt={movie.name}
        />
      </div>
      <article className="flex-1">
        <h2 className="text-3xl font-bold mb-2">{movie.name}</h2>
        <h3 className="text-xl italic text-gray-400 mb-4">
          {movie.origin_name}
        </h3>
        <p className="mt-2">{movie.description}</p>
        <p className="mt-2">Year: {movie.year}</p>
        <p className="mt-2">Time: {movie.time}</p>
        <p className="mt-2">Quality: {movie.quality}</p>
        <p className="mt-2">Favorites: {movie.favoriteCount || 0}</p>
        <p className="mt-2">
          Status:{" "}
          <span
            className={
              movie.status === "Available" ? "text-green-500" : "text-red-500"
            }
          >
            {movie.status}
          </span>
        </p>
        <p className="mt-2">
          Created At: {new Date(movie.createdAt).toLocaleDateString()}
        </p>
        <p className="mt-2">
          <strong>Categories:</strong> {categoryNames.join(", ")}
        </p>
        <p className="mt-2">
          <strong>Countries:</strong> {countryNames.join(", ")}
        </p>
      </article>
      <div className="flex flex-col space-y-2 ml-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200">
          Edit
        </button>
        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200">
          Delete
        </button>
      </div>
    </section>
  );
};

export default MovieDetail;
