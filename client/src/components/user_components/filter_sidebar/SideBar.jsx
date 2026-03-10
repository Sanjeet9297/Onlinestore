import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  FunnelIcon,
  MinusIcon,
  PlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid";
import ProductGrid from "../product_grid/ProductGrid";
import { advancedFetch } from "../../../api/product";
import { fetchCategories } from "../../../api/category";
import { getActiveOffer } from "../../../api/offer";
import Pagination from "../pagination/Pagination";
import { useSearchParams } from "react-router-dom";

const sortOptions = [
  { name: "Sort By", value: "", current: true },
  { name: "aA - zZ", value: "aToZ", current: false },
  { name: "zZ - aA", value: "zToA", current: false },
  { name: "Newest", value: "newArrival", current: false },
  { name: "Price: Low to High", value: "lowToHigh", current: false },
  { name: "Price: High to Low", value: "highToLow", current: false },
];
const subCategories = [
  { name: "Nike", href: "#" },
  { name: "Adidas", href: "#" },
  { name: "Puma", href: "#" },
  { name: "New Balance", href: "#" },
  { name: "Under Armour", href: "#" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const SideBar = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categoryOptions = categories.map((category) => ({
    value: category._id,
    label: category.name,
    checked: false,
  }));

  const filters = [
    // {
    //   id: "color",
    //   name: "Color",
    //   options: [
    //     { value: "white", label: "White", checked: false },
    //     { value: "beige", label: "Beige", checked: false },
    //     { value: "blue", label: "Blue", checked: true },
    //     { value: "brown", label: "Brown", checked: false },
    //     { value: "green", label: "Green", checked: false },
    //     { value: "purple", label: "Purple", checked: false },
    //   ],
    // },
    {
      id: "category",
      name: "Category",
      options: categoryOptions,
    },
    // {
    //   id: "size",
    //   name: "Size",
    //   options: [
    //     { value: "2l", label: "2L", checked: false },
    //     { value: "6l", label: "6L", checked: false },
    //     { value: "12l", label: "12L", checked: false },
    //     { value: "40l", label: "40L", checked: true },
    //   ],
    // },
  ];

  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 8;
  const [totalProducts, setTotalProducts] = useState(0);

  //Extract category from url
  const [searchParams] = useSearchParams();
  const categoryFromUrl = decodeURIComponent(
    searchParams.get("category") || ""
  );

  useEffect(() => {
    if (categories.length && categoryFromUrl) {
      const matchedCategory = categories.find(
        (cat) => cat.name.toLowerCase() === categoryFromUrl.toLowerCase()
      );
      if (matchedCategory) {
        setSelectedCategories([matchedCategory._id]);
      }
    }
  }, [categories, categoryFromUrl]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((item) => item !== category)
        : [...prevCategories, category]
    );
  };

  //FETCHING PRODUCTS
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const { products, totalProducts } = await advancedFetch({
          categories: selectedCategories,
          sort: sortOrder,
          currentPage,
          entriesPerPage,
          search: searchQuery,
        });
        setTotalProducts(totalProducts);
        setLoading(false);
        if (products) {
          setProducts(products.filter((product) => !product.isDeleted));
          setFilteredProducts(products);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching Products", error);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, [currentPage, searchQuery, sortOrder, selectedCategories]);

  //FETCHING CATEGORY AND OFFER
  useEffect(() => {
    const getItems = async () => {
      try {
        const { data } = await fetchCategories();
        setCategories(data.filter((item) => item.isDeleted !== true));

        const { activeOffer } = await getActiveOffer();
        setOffers(activeOffer);
      } catch (error) {
        console.error("Error fetching Category & Offer", error);
      }
    };
    getItems();
  }, []);

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  return (
    <div className="bg-white">
      <div>
        {/* Mobile filter dialog */}
        <Dialog
          open={mobileFiltersOpen}
          onClose={setMobileFiltersOpen}
          className="relative z-40 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 z-40 flex">
            <DialogPanel
              transition
              className="relative ml-auto flex h-full w-full max-w-xs transform flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl transition duration-300 ease-in-out data-[closed]:translate-x-full"
            >
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                </button>
              </div>

              {/* Filters */}
              <form className="mt-4 border-t border-gray-200">
                <h3 className="sr-only">Categories</h3>
                {/* <ul role="list" className="px-2 py-3 font-medium text-gray-900">
                  {subCategories.map((category) => (
                    <li key={category.name}>
                      <a href={category.href} className="block px-2 py-3">
                        {category.name}
                      </a>
                    </li>
                  ))}
                </ul> */}

                {filters.map((section) => (
                  <Disclosure
                    key={section.id}
                    as="div"
                    className="border-t border-gray-200 px-4 py-6"
                  >
                    <h3 className="-mx-2 -my-3 flow-root">
                      <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                        <span className="font-medium text-gray-900">
                          {section.name}
                        </span>
                        <span className="ml-6 flex items-center">
                          <PlusIcon
                            aria-hidden="true"
                            className="h-5 w-5 group-data-[open]:hidden"
                          />
                          <MinusIcon
                            aria-hidden="true"
                            className="h-5 w-5 [.group:not([data-open])_&]:hidden"
                          />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pt-6">
                      <div className="space-y-6">
                        {section.options.map((option, optionIdx) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              defaultValue={option.value}
                              defaultChecked={option.checked}
                              id={`filter-mobile-${section.id}-${optionIdx}`}
                              name={`${section.id}[]`}
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label
                              htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                              className="ml-3 min-w-0 flex-1 text-gray-500"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </form>
            </DialogPanel>
          </div>
        </Dialog>

        <main className="mx-auto max-w-7xl px-10 xl:px-2 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Products
            </h1>

            <div className="flex items-center">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sort
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                    />
                  </MenuButton>
                </div>

                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <MenuItem key={option.name}>
                        <button
                          onClick={() => handleSort(option.value)}
                          className={classNames(
                            option.current
                              ? "font-medium text-gray-900"
                              : "text-gray-500",
                            "block px-4 py-2 text-sm data-[focus]:bg-gray-100"
                          )}
                        >
                          {option.name}
                        </button>
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Menu>

              <button
                type="button"
                className="-m-2 ml-5 p-2 text-gray-400 hover:text-gray-500 sm:ml-7"
              >
                <span className="sr-only">View grid</span>
                <Squares2X2Icon aria-hidden="true" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
              >
                <span className="sr-only">Filters</span>
                <FunnelIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>

          <section aria-labelledby="products-heading" className="pb-24 pt-6">
            <h2 id="products-heading" className="sr-only">
              Products
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
              {/* Filters */}
              <form className="hidden lg:block">
                <h3 className="sr-only">Categories</h3>
                {/* <ul
                  role="list"
                  className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900"
                >
                  {subCategories.map((category) => (
                    <li key={category.name}>
                      <a href={category.href}>{category.name}</a>
                    </li>
                  ))}
                </ul> */}

                {filters.map((section) => (
                  <Disclosure
                    key={section.id}
                    as="div"
                    className="border-b border-gray-200 py-6"
                  >
                    <h3 className="-my-3 flow-root">
                      <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                        <span className="font-medium text-gray-900">
                          {section.name}
                        </span>
                        <span className="ml-6 flex items-center">
                          <PlusIcon
                            aria-hidden="true"
                            className="h-5 w-5 group-data-[open]:hidden"
                          />
                          <MinusIcon
                            aria-hidden="true"
                            className="h-5 w-5 [.group:not([data-open])_&]:hidden"
                          />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pt-6">
                      <div className="space-y-6">
                        {section.options.map((option, optionIdx) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`filter-mobile-${section.id}-${optionIdx}`}
                              name={`${section.id}[]`}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              checked={selectedCategories.includes(
                                option.value
                              )}
                              onChange={() =>
                                handleCategoryChange(option.value)
                              }
                            />
                            <label
                              htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                              className="ml-3 min-w-0 flex-1 text-gray-500"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </form>

              {/* Product grid */}
              <div className="lg:col-span-3 relative">
                {/* Your content */}

                <input
                  type="text"
                  placeholder="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 border-b border-b-gray-400 text-[20px] bg-transparent w-60 absolute right-0 text-black focus:ring-0 focus:outline-none focus:border-transparent focus:border-b-gray-400"
                />

                <ProductGrid
                  products={filteredProducts}
                  loading={loading}
                  offers={offers}
                />

                <Pagination
                  className="mx-auto"
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalEntries={totalProducts}
                  entriesPerPage={entriesPerPage}
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SideBar;
