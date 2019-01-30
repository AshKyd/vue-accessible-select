<template>
  <div
    :class="{
      'search-select--active': !!this.selectedMenuItem,
      'search-select': true
    }"
    ref="root"
    @keyup="e => onKeypress(e)"
    @click="e => onBlur()"
  >
    <label class="search-select__label" :for="id" :id="`${id}--label`">
      {{ label }}
      <span class="search-select__visually-hidden">
        {{ selectedValue }}: {{ accessLabel }}
      </span>
    </label>
    <div class="search-select__box">
      <input
        :id="id"
        type="search"
        v-model="searchText"
        :placeholder="placeholder"
        class="search-select__input"
        ref="search"
        @input="() => onSearch()"
        @click.stop.prevent="() => onClick()"
      />
      <button @click.prevent="() => toggle()" class="search-select__toggle">
        <span class="search-select__visually-hidden">
          {{ buttonLabel }}
        </span>
      </button>
    </div>
    <ul
      v-if="selectedMenuItem"
      role="listbox"
      tabindex="0"
      :aria-labelledby="`${id}--label`"
      class="search-select__listbox"
    >
      <li
        v-for="(item, index) in filteredValues"
        ref="item.label"
        role="option"
        :aria-selected="selectedValue === item.value"
        :class="{
          'search-select__option': true,
          'search-select__option-focused': index === selectedMenuItem - 1
        }"
      >
        <a
          href="#"
          @click.stop.prevent="() => select(item)"
          @mouseenter="() => (selectedMenuItem = index + 1)"
        >
          <component :is="renderComponent || defaultComponent" v-bind="item">
          </component>
        </a>
      </li>
    </ul>
  </div>
</template>
<script>
import BasicContent from "./basic-content";
export default {
  name: "search-select",
  props: {
    label: {
      type: String,
      required: false
    },
    accessLabel: {
      type: String,
      required: false,
      default: "Type to search or press down arrow to open list."
    },
    buttonLabel: {
      type: String,
      required: false,
      default: "Toggle list"
    },
    placeholder: {
      type: String,
      required: false,
      default: "Search"
    },
    values: {
      type: Array,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    renderComponent: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      selectedValue: null,
      selectedMenuItem: null,
      defaultComponent: BasicContent,
      searchText: "",
      focus: false
    };
  },
  beforeMount() {
    this.blurListener = ({ target }) => {
      if (!this.$refs.root.contains(target)) this.onBlur();
    };
    document.documentElement.addEventListener("click", this.blurListener);
    document.documentElement.addEventListener("keyup", this.blurListener);
  },
  updated() {
    if (!this.selectedMenuItem || !this.focus) return;
    const element = this.$refs.root.querySelectorAll(
      ".search-select__option a"
    )[this.selectedMenuItem - 1];
    element.focus();
  },
  beforeDestroy() {
    document.documentElement.removeEventListener("click", this.blurListener);
    document.documentElement.removeEventListener("keyup", this.blurListener);
  },
  computed: {
    filteredValues() {
      const searchText = this.searchText.toLowerCase();
      const values = this.values.filter(
        item =>
          String(item.value)
            .toLowerCase()
            .indexOf(searchText) !== -1
      );
      return this.sortByKeyword(searchText, values);
    }
  },
  methods: {
    sortByKeyword(keyword, values) {
      if (!keyword) return values;
      const keywordLowercase = keyword.toLowerCase();
      values.sort((a, b) => {
        if (a.value === b.value) return 0;
        const closenessA = String(a.value)
          .toLowerCase()
          .indexOf(keywordLowercase);
        const closenessB = String(b.value)
          .toLowerCase()
          .indexOf(keywordLowercase);
        return closenessA < closenessB ? -1 : 1;
      });
      return values;
    },
    select(item) {
      this.selectedValue = item.value;
      this.$emit("input", item.value);
      this.$emit("change", item);
      this.selectedMenuItem = null;
      this.$refs.search.focus();
    },
    onKeypress(e) {
      const { key, target } = e;
      const isInSearchBox = target === this.$refs.search;
      const events = {
        // Arrow down key opens the menu if required, and moves the selection cursor down.
        ArrowDown: () => {
          this.focus = true;
          this.selectedMenuItem = Math.min(
            this.selectedMenuItem + 1,
            this.filteredValues.length
          );
        },

        // Arrow up key moves the selection up by one
        ArrowUp: () => {
          this.focus = true;
          this.selectedMenuItem = Math.max(this.selectedMenuItem - 1, 1);
        },

        // Escape closes the menu
        Escape: () => {
          this.selectedMenuItem = null;
          this.$refs.search.focus();
        },

        // Enter selcts the current menu item, if one exists
        Enter: () => {
          if (!this.selectedMenuItem) return;
          this.select(this.filteredValues[this.selectedMenuItem - 1]);
        },

        // Backspace removes an item from the input (only useful if we're focused in the menu)
        Backspace: () => {
          if (isInSearchBox) return;
          this.selectedMenuItem = 1;
          this.searchText = this.searchText.substr(
            0,
            this.searchText.length - 1
          );
          this.$refs.search.focus();
        }
      };

      if (events[key]) {
        events[key]();
        e.preventDefault();
        return;
      }

      if (key.length === 1 && !isInSearchBox) {
        this.selectedMenuItem = 1;
        this.searchText += e.key;
        this.$refs.search.focus();
      }
    },
    onSearch() {
      this.selectedMenuItem = 1;
      this.focus = false;
    },
    onBlur(e) {
      this.selectedMenuItem = 0;
    },
    onClick() {
      if (window.innerWidth < 768) {
        this.selectedMenuItem = 1;
        window.scrollTo(0, 1);
      }
    }
  }
};
</script>
<style>
.search-select__visually-hidden {
  /* https://snook.ca/archives/html_and_css/hiding-content-for-accessibility */
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
  clip: rect(1px, 1px, 1px, 1px);
}

.search-select,
.search-select * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  list-style: none;
  border: none;
  background: transparent;
}

.search-select {
  display: block;
  position: relative;
  transition: background-color 0.2s;
}

.search-select__box {
  background: white;
  border: 1px solid #ccc;
  color: black;
}
.search-select__input {
  width: 100%;
  padding: 5px;
}
.search-select__option + .search-select__option {
  border-top: 1px solid #eee;
}
.search-select__listbox a {
  display: block;
  color: black;
  text-decoration: none;
  outline: none;
  cursor: default;
}
.search-select__option-focused {
  background: #f4f4f4;
}

.search-select__toggle {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
}

@media (min-width: 768px) {
  .search-select__listbox {
    position: absolute;
    top: 100%;
    left: -1px;
    width: calc(100% + 2px);
    background: white;
    color: black;
    border: 1px solid #ccc;
  }
}

@media (max-width: 767px) {
  .search-select--active {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column-reverse;
    justify-content: end;
  }
  .search-select__input {
    padding: 10px;
  }
  .search-select--active .search-select__box {
    margin-top: -1px;
  }
  .search-select__listbox {
    background: white;
    color: black;
    border: 1px solid #ccc;
    @animation: 0.2s search-select-in;
  }
  .search-select__listbox a {
    padding: 10px 0;
  }
}
@keyframes search-select-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
