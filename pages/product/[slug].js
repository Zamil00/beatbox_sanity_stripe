import { useState, useEffect } from 'react'
import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiFillStar,
  AiOutlineStar,
} from 'react-icons/ai'
import { Product } from '@/components'

import { useStateContext } from '@/context/StateContext'

// Import the Sanity client
import { client, urlFor } from '@/lib/client'

// -< ProductDetail >- component
export default function ProductDetail({ product, products }) {
  // Get the state from the context
  const { qty, decQty, incQty, onAdd, setShowCart } = useStateContext()

  // Destructure the product object
  const { image, name, details, price } = product
  // State to keep track of which image is selected
  const [index, setIndex] = useState(0)

  const handleBuyNow = () => {
    onAdd(product, qty)

    setShowCart(true)
  }

  return (
    <div>
      <div className='product-detail-container'>
        <div>
          {/* Product - main image (also the image that a user has selected) */}
          <div className='image-container'>
            <img
              src={urlFor(image && image[index])}
              alt={`${name}`}
              className='product-detail-image'
            />
          </div>

          {/* Product - all images that a user can select to view */}
          <div className='small-images-container'>
            {image?.map((item, i) => (
              <img
                key={i}
                src={urlFor(item)}
                className={
                  i === index ? 'small-image selected-image' : 'small-image'
                }
                // select image on mouse enter (hover state on desktop, click on mobile)
                onMouseEnter={() => setIndex(i)}
                alt={`${i} ${name}`}
              />
            ))}
          </div>
        </div>

        {/* Product - details */}
        <div className='product-detail-desc'>
          <h1>{name}</h1>
          <div className='reviews'>
            <div>
              <AiFillStar />
              <AiFillStar />
              <AiFillStar />
              <AiFillStar />
              <AiOutlineStar />
            </div>
            <p>(20)</p>
          </div>
          <h4>Details: </h4>
          <p>{details}</p>
          <p className='price'>${price}</p>
          <div className='quantity'>
            <h3>Quantity:</h3>
            <p className='quantity-desc'>
              <span className='minus' onClick={decQty}>
                <AiOutlineMinus />
              </span>
              <span className='num'>{qty}</span>
              <span className='plus' onClick={incQty}>
                <AiOutlinePlus />
              </span>
            </p>
          </div>
          <div className='buttons'>
            <button
              type='button'
              className='add-to-cart'
              onClick={() => {
                onAdd(product, qty)
              }}
            >
              Add to Cart
            </button>
            <button type='button' className='buy-now' onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* "You may also like" section - marquee of images */}
      <div className='maylike-products-wrapper'>
        <h2>You may also like</h2>

        {/* TODO: Add a marquee react library for infinite scrolling */}
        <div className='marquee'>
          <div className='maylike-products-container track'>
            {products.map((item) => (
              <Product key={item._id} product={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// -< getStaticPaths >- and -< getStaticProps >- methods
// Fetch all products from sanity to generate paths (needed for SSG below)
export const getStaticPaths = async () => {
  const query = `*[_type == "product"] {
    slug {
      current
    }
  }
  `;

  const products = await client.fetch(query);

  const paths = products.map((product) => ({
    params: { 
      slug: product.slug.current
    }
  }));

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps = async ({ params: { slug }}) => {
  const query = `*[_type == "product" && slug.current == '${slug}'][0]`;
  const productsQuery = '*[_type == "product"]'
  
  const product = await client.fetch(query);
  const products = await client.fetch(productsQuery);

  console.log(product);

  return {
    props: { products, product }
  }
}

