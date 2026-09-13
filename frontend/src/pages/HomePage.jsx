import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import '../assets/css/home.css'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState(null)
  const [addedId, setAddedId] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchApi('/api/categories')
        setCategories(data || [])
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const query = activeCategory !== 'all' ? `?category=${activeCategory}` : ''
        const data = await fetchApi(`/api/products${query}`)
        setProducts(data || [])
      } catch (err) {
        console.error('Error fetching products:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [activeCategory])

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login')
      return
    }
    setAddingId(product.product_id)
    try {
      await fetchApi('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.product_id }),
      })
      setAddedId(product.product_id)
      setTimeout(() => setAddedId(null), 2000)
    } catch (err) {
      if (err.status === 401) {
        navigate('/login')
      } else {
        alert('Error adding to cart: ' + err.message)
      }
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div>
      HomePage <br /> <br />

      <button onClick={() => navigate("/login")}>Login</button>

    </div>
  )
}

export default HomePage