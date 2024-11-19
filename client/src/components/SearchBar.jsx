import {
  Dialog,
  DialogBody,
  DialogHeader,
  IconButton
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Spinner from "./CustomSpinner";
import MapItem from "./MapItem";
import SkeletonItem from "../skeletons/SkeletonItem";
import axios from 'axios';
import { useState, useRef, useCallback, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import debounce from 'lodash.debounce';
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchBar({ openSearch, setOpenSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const page = useRef(0);
  const [hasMore, setHasMore] = useState(false);

  const handleSearchChange = (e) => {
    const term = sanitizeTerm(e.target.value);
    setSearchTerm(term);
    page.current = 0;
    setHasMore(true);
    setIsSearching(true);
    debouncedFetchSearchResults(term);
  };

  const sanitizeTerm = (term) => {
    return term.replace(/[^a-zA-Z0-9 ]/g, '');
  };

  const fetchSearchResults = async (term) => {
    if (term) {
      try {    
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/search/${term}/0`);
        setSearchResults(response.data);
        if (response.data.length === 0) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setHasMore(false);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setHasMore(false);
      setIsSearching(false);
    }
  };

  const debouncedFetchSearchResults = useCallback(debounce(fetchSearchResults, 500), []);

  useEffect(() => {
    return () => {
      debouncedFetchSearchResults.cancel();
    };
  }, [debouncedFetchSearchResults]);

  const fetchData = async () => {
    if (searchTerm) {
      try {
        page.current += 1;
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/search/${searchTerm}/${page.current}`);   
        const newRows = response.data;
        if (newRows.length === 0) {
          setSearchResults(prevRows => prevRows.filter(row => row !== null));
          setHasMore(false);
          return;
        }
        setSearchResults(prevRows => {
          const filteredRows = prevRows.filter(row => row !== null);
          return [...filteredRows, ...newRows];
      });
      } catch (error) {
        console.error('Error fetching search results:', error);
        setHasMore(false);
      }
    }
  };


  return (
    <Dialog
        open={openSearch}
        size="lg"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 1, y: 0 },
        }}
        className="bg-osuslate-500"
      >
        <DialogHeader className="h-24 flex relative">
            <MagnifyingGlassIcon className="h-8 w-8 text-gray-300 opacity-50 absolute left-7 top-8" strokeWidth={3} />
            <div className="text-2xl w-full">
            
              <input
              type="text"
              placeholder="search for beatmaps"
              className="w-full p-4 bg-osuslate-300 text-white rounded-lg pl-14 outline-none opacity-50 font-bold italic caret-gray-300"
              value={searchTerm}
              onChange={handleSearchChange}
          />
            </div>
          
          <IconButton
            ripple={false}
            onClick={() => setOpenSearch(false)}
            className="bg-transparent focus:bg-transparent active:bg-transparent shadow-none absolute right-5 top-7"
          >
                      {isSearching ? (
            <Spinner />
          ) : (
            <XMarkIcon className="h-9 w-9 text-osuslate-50" strokeWidth={3} />
          )}
          </IconButton>
        </DialogHeader>
        <DialogBody id="scrollableDiv" className="max-h-[60vh] scrollbar scrollbar-thumb-osuslate-200 overflow-y-auto">
          <InfiniteScroll
            className="flex flex-col gap-4 px-10 pt-2"
            dataLength={searchResults.length}
            next={fetchData}
            loader={<>
            <SkeletonItem type="popular"/>
            <SkeletonItem type="popular"/>
            <SkeletonItem type="popular"/>
            </>}
            hasMore={hasMore}
            scrollThreshold={0.9}
            endMessage={<p className="mx-auto text-osuslate-100 font-visby font-bold text-xl mb-4">No Beatmaps Found</p>}
            scrollableTarget="scrollableDiv">
            {searchResults.map((row, index) => (
              <MapItem 
                  key={index}
                  mapId={row.BEATMAP_ID} 
                  mapName={row.t} 
                  mapArtist={row.a} 
                  mapper={row.m} 
                  tableType="none"
                  weeklyCount={row.weekly_count}
                  monthlyCount={row.monthly_count}
                  yearlyCount={row.yearly_count}
                  alltimeCount={row.alltime_count} />
            ))}
          </InfiniteScroll>
        </DialogBody>
      </Dialog>
  );
}