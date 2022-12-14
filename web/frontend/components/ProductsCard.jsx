import {useEffect, useState} from "react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle, ResourceList,
} from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function ProductsCard() {
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const [products, setProducts] = useState([]);
  const [lastProduct, setLastProduct] = useState({});
  const fetch = useAuthenticatedFetch();

  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/products/count",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false)
      },
    },
  });

  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  useEffect( () => {
    fetch("/api/products/list").then(res => {
        res.json().then(val => {
          setProducts(val)
          setLastProduct(val[val.length-1])
        })
      }).catch(err => {
        console.log(err)
      })

    // testing orders and pagination
    fetch("/api/orders/list").then(res => {
      res.json().then(value => {
        console.log(value)
      }).catch(err => {
        console.log(err)
      })
    })
  }, [])

  const handleMoreProductsButtonClick = () => {
    fetch(`/api/products/list?sinceId=${lastProduct.id}`).then(res => {
      res.json().then(val => {
        // if there is no more products to display
        if (val.length > 0) {
          const addedProducts = products.concat(val)
          setProducts(addedProducts)
          setLastProduct(val[val.length-1])
        }
      })
    }).catch(err => {
      console.log(err)
    })
  }

  const handlePopulate = async () => {
    setIsLoading(true);
    const response = await fetch("/api/products/create");

    if (response.ok) {
      await refetchProductCount();
      setToastProps({ content: "5 products created!" });
    } else {
      setIsLoading(false);
      setToastProps({
        content: "There was an error creating products",
        error: true,
      });
    }
  };

  return (
    <>
      {toastMarkup}
      <Card
        title="Product Counter"
        sectioned
        primaryFooterAction={{
          content: "Populate 5 products",
          onAction: handlePopulate,
          loading: isLoading,
        }}
      >
        <TextContainer spacing="loose">
          <p>
            Sample products are created with a default title and price. You can
            remove them at any time.
          </p>
          <Heading element="h4">
            TOTAL PRODUCTS
            <DisplayText size="medium">
              <TextStyle variation="strong">
                {isLoadingCount ? "-" : data.count}
              </TextStyle>
            </DisplayText>
          </Heading>

          <div>
            {
              products.map((p,index) => {
                return (
                  <div key={index}>
                    {p.id} - {p.title}
                  </div>
                )
              })
            }
          </div>

          <div>
            <button onClick={handleMoreProductsButtonClick}>
              Afficher plus de produit
            </button>
          </div>

        </TextContainer>
      </Card>
    </>
  );
}
