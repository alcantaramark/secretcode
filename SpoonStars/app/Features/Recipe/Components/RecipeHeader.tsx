import React, { FC, createContext, useEffect, useRef, useState } from 'react';
import { Button, SegmentedButtons, TextInput } from 'react-native-paper';
import { Dimensions, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useAppTheme } from '../../../App'
import { selectRecipeTags, selectRecipePreferencesStatus, updateRecipePreference, 
    saveRecipePreference, fetchRecipes, clearRecipes } from '../RecipeSlice';
import { useAppSelector, useAppDispatch } from './../../../Redux/Hooks';
import RecipeMain from './RecipeMain';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { selectShowFullResults, saveSearchHistory, 
    fetchSearchHistory, suggestRecipesByName, 
    suggestRecipesByIngredients, selectSearchSuggestions, clearSuggestions, setShowFullResults, clearHistory, clearPaging } 
    from './../../Search/SearchSlice';
import PreviewResults from './../../Search/Components/PreviewResults';
import FullResults from './../../Search/Components/FullResults';



interface RecipeHeaderProps {}

export const HomeContext = createContext(null as any);

const RecipeHeader: FC<RecipeHeaderProps> = () => { 
  const [searchText, setSearchText] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [isSearching, setIsSearching] = useState(false);
  
  const autocompleteField = useRef<any>(null);

  const { colors: { primary } } = useAppTheme();
  const recipeTags = useAppSelector(selectRecipeTags);
  const preferenceStatus = useAppSelector(selectRecipePreferencesStatus);
  const searchSuggestions = useAppSelector(selectSearchSuggestions);
  const showFullResults = useAppSelector(selectShowFullResults);
  
  const dispatch = useAppDispatch();
  const [tagStyles, setTagStyles] = useState<string[]>([]);
  const fetchHistory = async () => { 
    await dispatch(fetchSearchHistory());
  }

  const styles = StyleSheet.create({
    loading: {
      alignContent: "center"
    },
    recipeTag: {
      backgroundColor: primary,
    },
    container: {
      backgroundColor: primary,
    },
    header: {
      backgroundColor: 'transparent'
    },
    searchInput: {
      flexDirection: 'row',
    },
    searchInputField: {
      width: Dimensions.get('screen').width - 20,
      height: 40,
      marginStart: 10,
    },
    searchInputFieldActive: {
      width: Dimensions.get('screen').width - 52,
      height: 40,
      marginStart: 5,
    },
    searchIconBack: {
      color: 'gray',
      fontSize: 30,
      top: 8,
      marginStart: 10
    },
    searchIconMagnify: {
      color: 'gray',
      fontSize: 25,
    },
    scroll: {
      marginTop: 5,
      marginBottom: 10,
    },
    searchBy: {
      height: 28,
      margin: 10,
      borderRadius: 10,
      
    }
  })

  
  const handlePreferencePress = (index: number) => {
    const nextStyles = tagStyles.map((item, i) => {
      if (index == i) {
        item = item === 'white' ? 'black' : 'white';
      }
      else {
        item = 'black';
      }
      return item;
    });

    dispatch(clearRecipes());
    setTagStyles(nextStyles);
    dispatch(updateRecipePreference(index));
    dispatch(saveRecipePreference());
    dispatch(fetchRecipes());
  };

  useEffect(() => {
    if (preferenceStatus === 'succeeded') {
      const modes = recipeTags.map(item => item.preferred == true ? 'white' : 'black'); 
      setTagStyles(modes);
    }
  }, [preferenceStatus]);

  useEffect(() => { 

  }, [searchSuggestions]);

  const createButtons = () => {
    return ( 
      recipeTags.map((item, index) => {
        return (
          <Button 
            compact={true} 
            textColor={tagStyles[index]}
            mode='text'
            onPress={() => handlePreferencePress(index)} 
            key={index}>{item.name}
          </Button>
        )
      })
    )
  }

  const handleSearchTextChanged =  async (text: string) => {
    if (searchText === text || text === ''){
      dispatch(clearPaging());
      dispatch(setShowFullResults(true));
      startSearch(true, text);
    }
    else {
      dispatch(setShowFullResults(false));
      startSearch(false, text);
    }
    setSearchText(text);
  }

  const handleEnterPress = async () => {
    await dispatch(saveSearchHistory(searchText));
  }

  const startSearch = async (all: boolean, text?:string) => {
    setTimeout(async () => {
      if (searchBy === 'name') {
        await dispatch(suggestRecipesByName({ name: text == undefined || text === '' ? '': text, searchAll: all }));
      }
      else {
        await dispatch(suggestRecipesByIngredients({
          ingredients: text == undefined || text === '' ?  []: text.split(' '),
          searchAll: all
        }));
      }
    }, 1000);
  }

  const handleSearchIconPress = () => {
    setIsSearching(false);
    setSearchText('');
    setSearchBy('name');
    autocompleteField.current.blur();
  }

  const handleSearchOnFocus = async () => {
    if (searchText === ''){
      await fetchHistory();
      setIsSearching(true) ;
      dispatch(setShowFullResults(true));
      startSearch(true);
    }
  }

  const handleSearchByValueChange = (val: string) => {
    startSearch(true, searchText);
    setSearchBy(val);
  }

  const handleSearchOnBlur = () => {
    
  }

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.searchInput}>
          {isSearching &&
            <MaterialCommunityIcons 
              name='arrow-left-thin' style={styles.searchIconBack} 
              onPress={handleSearchIconPress}
            />
          }
          <TextInput
            theme={{ roundness: 10 }}
            placeholder='search recipes...'
            value={searchText}
            style={ isSearching ? styles.searchInputFieldActive : styles.searchInputField }
            onChangeText={(text: string) => handleSearchTextChanged(text)}
            mode='outlined'
            ref={autocompleteField}
            left={ !isSearching &&
                <TextInput.Icon 
                  icon={() => <MaterialCommunityIcons name='magnify' style={styles.searchIconMagnify} /> }  
                />
            }
            onFocus={handleSearchOnFocus}
            onSubmitEditing={handleEnterPress}
          />
        </View>
        {isSearching &&
          <SegmentedButtons 
            value={searchBy}
            style={styles.searchBy}
            buttons={[
              { value: 'name', label: 'Name', checkedColor: primary },
              { value: 'ingredients', label: 'Ingredients', checkedColor: primary }
            ]}
            onValueChange={(val) => handleSearchByValueChange(val) }
            density='high'
            theme={useAppTheme}
          />
        }
        {!isSearching && 
          <GestureHandlerRootView>
            <ScrollView horizontal={true} 
              showsHorizontalScrollIndicator={false} 
              style={styles.scroll}
            >
          { createButtons() }
             </ScrollView>
          </GestureHandlerRootView> 
        }  
        </View> 
        { (isSearching && showFullResults) && <FullResults /> }
        { (isSearching && !showFullResults) && <PreviewResults /> }
        { (!isSearching) && <RecipeMain /> }
    </View>
)};


export default RecipeHeader;
